import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/Header"
import { PostCard } from "@/components/PostCard"
import { CreatePostDialog } from "@/components/CreatePostDialog"
import { ContactModal } from "@/components/ContactModal"
import { PostDetail } from "@/components/PostDetail"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SAMPLE_POSTS } from "@/data/samplePosts"
import type { Post } from "@/types"
import { scoreMatch } from "@/services/groq";
import { Sparkles, Search, Filter, TrendingUp, MapPin, Trash2, Info } from "lucide-react"

const STORAGE_KEY = "foundvit_posts"

function useTheme() {
  const [theme, setTheme] = useState<"light"|"dark">(()=> (localStorage.getItem("foundvit_theme") as any) || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark":"light"))
  useEffect(()=>{
    document.documentElement.classList.toggle("dark", theme==="dark")
    localStorage.setItem("foundvit_theme", theme)
  },[theme])
  return { theme, toggle: ()=> setTheme(t=> t==="dark"?"light":"dark") }
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [posts, setPosts] = useState<Post[]>(()=>{
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Post[]
        // merge sample ids not in storage for demo persistence
        const ids = new Set(parsed.map(p=>p.id))
        const missing = SAMPLE_POSTS.filter(s=>!ids.has(s.id))
        return [...parsed, ...missing].sort((a,b)=> +new Date(b.createdAt)- +new Date(a.createdAt))
      }
    } catch {}
    return SAMPLE_POSTS
  })
  useEffect(()=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)) },[posts])

  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState<"all"|"lost"|"found">("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [contactPost, setContactPost] = useState<Post|null>(null)
  const [detailPost, setDetailPost] = useState<Post|null>(null)

  const filtered = useMemo(()=>{
    let list = [...posts]
    if (locationFilter!=="all") list = list.filter(p=> p.location===locationFilter)
    if (typeFilter!=="all") list = list.filter(p=> p.type===typeFilter)
    if (search.trim()) {
      const scored = list.map(p=> ({ p, s: scoreMatch(search, p)}))
        .filter(x=> x.s>0)
        .sort((a,b)=> b.s - a.s)
      list = scored.map(x=> x.p)
      // if no scored, do substring fallback
      if (!list.length) {
        const q = search.toLowerCase()
        list = posts.filter(p=> (p.title+p.description+p.locationLabel).toLowerCase().includes(q))
          .filter(p=> locationFilter==="all" || p.location===locationFilter)
          .filter(p=> typeFilter==="all" || p.type===typeFilter)
      }
    } else {
      list.sort((a,b)=> +new Date(b.createdAt)- +new Date(a.createdAt))
    }
    return list
  },[posts, search, locationFilter, typeFilter])

  const stats = useMemo(()=>({
    total: posts.length,
    found: posts.filter(p=>p.type==="found").length,
    lost: posts.filter(p=>p.type==="lost").length,
  }),[posts])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header search={search} setSearch={setSearch} locationFilter={locationFilter} setLocationFilter={setLocationFilter} onCreate={()=>setCreateOpen(true)} theme={theme} toggleTheme={toggle} />

      {/* Hero / stats bar */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-[24px] bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-64 w-64 bg-white/10 rounded-full blur-3xl"/>
          <div className="absolute -left-12 -bottom-12 h-64 w-64 bg-black/10 rounded-full blur-3xl"/>
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold tracking-wide"><Sparkles className="h-3.5 w-3.5"/> Powered by Gemini Vision</div>
            <h1 className="font-display font-extrabold text-[28px] sm:text-[36px] leading-none mt-3">Lost something at VIT?<br/>Find it in seconds.</h1>
            <p className="text-white/80 mt-3 max-w-[560px] text-sm sm:text-[15px] leading-relaxed">Hyperlocal feed for VIT Chennai. AI tags every item, moderates uploads, and matches your description across campus locations.</p>

            <div className="flex flex-wrap gap-3 mt-5">
              <div className="flex-1 min-w-[280px] max-w-[520px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"/>
                <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Describe what you lost — 'red nike bag gym' or 'airpods library'" className="pl-9 h-11 rounded-full bg-white text-zinc-900 placeholder:text-zinc-500 border-0" />
              </div>
              <Button variant="secondary" className="rounded-full h-11 bg-white text-zinc-900 hover:bg-zinc-100 font-semibold" onClick={()=>{ if(!search.trim()) setSearch("watch")}}>Try AI Search</Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <span className="bg-white text-zinc-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5"/>{stats.total} active posts</span>
              <span className="bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">{stats.found} found</span>
              <span className="bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur">{stats.lost} lost</span>
              <span className="bg-white/15 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur hidden sm:inline-flex items-center gap-1"><MapPin className="h-3 w-3"/> 20 VIT locations</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            <Tabs value={typeFilter} onValueChange={v=>setTypeFilter(v as any)}>
              <TabsList className="rounded-full p-1">
                <TabsTrigger value="all" className="rounded-full px-5">All</TabsTrigger>
                <TabsTrigger value="found" className="rounded-full px-5">Found</TabsTrigger>
                <TabsTrigger value="lost" className="rounded-full px-5">Lost</TabsTrigger>
              </TabsList>
            </Tabs>
            <span className="text-sm text-muted-foreground hidden sm:inline-flex items-center gap-1"><Filter className="h-4 w-4"/>{filtered.length} results</span>
          </div>
          <div className="flex items-center gap-2">
            { (search || locationFilter!=="all" || typeFilter!=="all") && (
              <Button variant="ghost" size="sm" className="rounded-full" onClick={()=>{setSearch(""); setLocationFilter("all"); setTypeFilter("all")}}>Clear filters</Button>
            )}
            <Button variant="outline" size="sm" className="rounded-full" onClick={()=>{ localStorage.removeItem(STORAGE_KEY); setPosts(SAMPLE_POSTS)}}><Trash2 className="h-4 w-4"/> Reset demo</Button>
          </div>
        </div>

        {filtered.length===0 && (
          <div className="mt-8 rounded-2xl border-2 border-dashed bg-card p-10 text-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mx-auto"><Search className="h-6 w-6 text-muted-foreground"/></div>
            <div className="font-semibold mt-3">No matches</div>
            <div className="text-sm text-muted-foreground mt-1">Try a broader description or switch location filter. AI matching uses item, color, brand & location.</div>
            <Button variant="outline" className="mt-4 rounded-full" onClick={()=>{setSearch(""); setLocationFilter("all")}}>Clear search</Button>
          </div>
        )}

        {/* Feed grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {filtered.map(p=> <PostCard key={p.id} post={p} onContact={setContactPost as any} onView={setDetailPost as any} />)}
        </div>

      </div>

      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={(p)=> setPosts(prev=>[p, ...prev])} />
      <ContactModal post={contactPost} open={!!contactPost} onOpenChange={o=> !o && setContactPost(null)} />
      <PostDetail post={detailPost} open={!!detailPost} onOpenChange={o=> !o && setDetailPost(null)} onContact={p=>{ setDetailPost(null); setContactPost(p)}} />
    </div>
  )
}
