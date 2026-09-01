import { useEffect, useState } from "react"
import { X, Upload, Sparkles, ShieldAlert, ShieldCheck, Loader2, Image as ImageIcon, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { VIT_LOCATIONS } from "@/data/locations"
import type { Post, PostType } from "@/types"
import { analyzeImages } from "@/services/gemini"
import { CURRENT_USER } from "@/data/samplePosts"

export function CreatePostDialog({ open, onOpenChange, onCreate }: { open:boolean; onOpenChange:(v:boolean)=>void; onCreate:(p:Post)=>void }) {
  const [type, setType] = useState<PostType>("found")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [moderation, setModeration] = useState<any>(null)
  const [base64s, setBase64s] = useState<string[]>([])

  useEffect(() => {
    return () => previews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url)
    })
  }, [previews])

  const reset = () => {
    setTitle(""); setDescription(""); setLocation(""); setFiles([]); setPreviews([]); setAnalysis(null); setModeration(null); setBase64s([]); setProgress(""); setAnalyzing(false)
  }

  const handleFiles = async (fl: FileList | null) => {
    if (!fl) return
    const arr = Array.from(fl).slice(0,4)
    setFiles(arr)
    const urls = arr.map(f=> URL.createObjectURL(f))
    setPreviews(urls)
    const b64s: string[] = []
    for (const f of arr) {
      const b = await new Promise<string>((res)=>{
        const r=new FileReader(); r.onload=()=>res(r.result as string); r.readAsDataURL(f)
      })
      b64s.push(b)
    }
    setBase64s(b64s)
    setAnalysis(null); setModeration(null)
  }

  const runAnalysis = async () => {
    if (!files.length) return
    setAnalyzing(true)
    try {
      const { analysis: a, moderation: m } = await analyzeImages({ files, base64s, hint: title+" "+description, onProgress: setProgress })
      setAnalysis(a); setModeration(m); setProgress("")
    } catch (e:any) {
      setProgress(e.message)
    } finally { setAnalyzing(false) }
  }

  // Allow posting even when AI analysis is unavailable; moderation is optional.
  const canPost = Boolean(title.trim() && description.trim() && location && previews.length > 0)

  const handlePost = () => {
    const locLabel = VIT_LOCATIONS.find(l=>l.id===location)?.label ?? location
    const newPost: Post = {
      id: Date.now().toString(),
      type, title: title.trim(), description: description.trim(),
      // Persist data URLs so posts survive re-renders and localStorage reloads.
      images: base64s.length ? base64s : previews,
      location, locationLabel: locLabel,
      createdAt: new Date().toISOString(),
      author: { name: CURRENT_USER.name, handle: CURRENT_USER.handle, avatar: CURRENT_USER.avatar },
      status: "open",
      analysis: analysis ?? undefined,
      moderation: moderation ?? undefined,
    }
    onCreate(newPost)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) reset(); onOpenChange(v)}}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-xl"><span className="h-8 w-8 rounded-lg bg-primary text-white grid place-items-center"><Upload className="h-4 w-4"/></span> Create Post</DialogTitle>
          <DialogDescription>Upload multiple images — Gemini Vision will analyze & moderate before posting. VIT location is required.</DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          <Tabs value={type} onValueChange={v=>setType(v as PostType)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="found">🎉 I Found Something</TabsTrigger>
              <TabsTrigger value="lost">😢 I Lost Something</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Image upload */}
          <div>
            <Label>Images (up to 4) *</Label>
            <div className="mt-2">
              {previews.length===0 ? (
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/20 p-8 cursor-pointer hover:bg-muted/30 transition">
                  <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center"><ImageIcon className="h-6 w-6 text-primary"/></div>
                  <div className="text-sm font-medium">Click to upload or drag & drop</div>
                  <div className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</div>
                  <Input type="file" accept="image/*" multiple className="hidden" onChange={e=>handleFiles(e.target.files)} />
                  <input type="file" accept="image/*" multiple className="hidden" id="hidden-file-input" onChange={e=>handleFiles(e.target.files)} />
                </label>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {previews.map((src,i)=>(
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border bg-muted">
                      <img src={src} className="w-full h-full object-cover" alt={`preview ${i}`} />
                      <button onClick={()=>{
                        const nf=[...files]; const np=[...previews]; const nb=[...base64s];
                        nf.splice(i,1); np.splice(i,1); nb.splice(i,1);
                        setFiles(nf); setPreviews(np); setBase64s(nb); setAnalysis(null); setModeration(null)
                      }} className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition"><X className="h-4 w-4"/></button>
                    </div>
                  ))}
                  {previews.length<4 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed grid place-items-center cursor-pointer bg-muted/20 hover:bg-muted/30">
                      <PlusIcon />
                      <Input type="file" accept="image/*" multiple className="hidden" onChange={e=>handleFiles(e.target.files)} />
                    </label>
                  )}
                </div>
              )}
              {/* quick replace tip */}
              <p className="text-xs text-muted-foreground mt-2">💡 Tip: Put your images in <code className="bg-muted px-1 rounded">public/images/</code> and reference as <code className="bg-muted px-1 rounded">/images/sample-X.jpg</code> in samplePosts.ts for demo data.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>VIT Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {VIT_LOCATIONS.map(l=> <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder={type==="found"?"Found — Black Casio Watch":"Lost — Blue Hydro Flask"} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Add details that help matching — color, brand, where exactly, distinguishing marks..." rows={3} className="mt-1.5" />
          </div>

          {/* Analyze */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm"><Sparkles className="h-4 w-4 text-primary"/> Gemini Vision Analysis</div>
              <Button size="sm" variant="secondary" disabled={!previews.length || analyzing} onClick={runAnalysis} className="rounded-full">
                {analyzing? <><Loader2 className="h-4 w-4 animate-spin"/> Analyzing…</>: "Analyze Images"}
              </Button>
            </div>
            {progress && <p className="text-xs text-muted-foreground mt-2 animate-pulse">{progress}</p>}
            {!analysis && !moderation && !analyzing && <p className="text-xs text-muted-foreground mt-2">Upload images & click Analyze. Moderation runs automatically.</p>}

            {moderation && !moderation.approved && (
              <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 flex gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5"/>
                <div>
                  <div className="text-sm font-semibold text-red-700 dark:text-red-400">Upload rejected</div>
                  <div className="text-sm text-red-600 dark:text-red-300/80">{moderation.reason ?? "Failed moderation checks."}</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">{moderation.flags.map((f:string)=><Badge key={f} variant="destructive" className="text-xs">{f}</Badge>)}</div>
                  <p className="text-xs text-muted-foreground mt-2">Please replace images with a clear photo of the item only (no people, memes, or unrelated content).</p>
                </div>
              </div>
            )}

            {analysis && moderation?.approved && (
              <div className="mt-3">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><ShieldCheck className="h-4 w-4"/> Approved — ready to post</div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-2.5 border"><div className="text-muted-foreground">Category</div><div className="font-semibold">{analysis.category}</div></div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-2.5 border"><div className="text-muted-foreground">Item</div><div className="font-semibold">{analysis.item}</div></div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-2.5 border"><div className="text-muted-foreground">Color</div><div className="font-semibold">{analysis.color}</div></div>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-2.5 border"><div className="text-muted-foreground">Confidence</div><div className="font-bold text-primary">{analysis.confidence}%</div></div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {analysis.characteristics.map((c:string)=><Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                    {analysis.brand && <Badge variant="outline" className="text-xs bg-white dark:bg-zinc-900">{analysis.brand}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{analysis.description}</p>
                  <div className="mt-2 h-2 bg-white dark:bg-zinc-800 rounded-full overflow-hidden border">
                    <div className="h-full bg-emerald-500" style={{width:`${analysis.confidence}%`}}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {moderation && !moderation.approved && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3"><AlertTriangle className="h-4 w-4"/> Fix the images and re-analyze before posting.</div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 flex gap-3 justify-end">
          <Button variant="outline" onClick={()=>onOpenChange(false)} className="rounded-full">Cancel</Button>
          <Button size="sm" disabled={!canPost} onClick={handlePost} className="rounded-full font-semibold px-4">Post</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PlusIcon(){ return <div className="text-center"><div className="h-8 w-8 rounded-full bg-muted grid place-items-center mx-auto"><span className="text-xl leading-none">+</span></div><div className="text-xs font-medium mt-1">Add</div></div>}
