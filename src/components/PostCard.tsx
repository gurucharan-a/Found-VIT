import { MapPin, Clock, ShieldCheck, Sparkles, MessageCircleMore, Eye, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Post } from "@/types"

function timeAgo(iso:string){
  const s = (Date.now() - new Date(iso).getTime())/1000
  if(s<60) return "just now"
  if(s<3600) return `${Math.floor(s/60)}m ago`
  if(s<86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export function PostCard({ post, onContact, onView }: { post: Post; onContact:(p:Post)=>void; onView:(p:Post)=>void }) {
  const isFound = post.type==="found"
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-muted/60 hover:border-primary/15 hover:-translate-y-0.5">
      {/* image carousel simple */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden cursor-pointer" onClick={()=>onView(post)}>
        <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" loading="lazy" />
        {post.images.length>1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">+{post.images.length-1} more</div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={isFound ? "success" : "warning"} className="shadow-sm font-bold tracking-wide uppercase text-[11px] px-2.5 py-1">
            {isFound ? "Found" : "Lost"}
          </Badge>
          {post.analysis && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/95 text-zinc-800 text-xs px-2.5 py-1 rounded-full font-medium shadow"><Sparkles className="h-3 w-3 text-primary"/> {post.analysis.confidence}% AI</span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur text-zinc-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow"><Clock className="h-3 w-3"/>{timeAgo(post.createdAt)}</span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full font-medium"><MapPin className="h-3 w-3"/>{post.locationLabel}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3"/> {Math.floor(Math.random()*40+8)} views</span>
        </div>
        <h3 className="font-semibold leading-tight line-clamp-2 text-[15px] cursor-pointer hover:text-primary" onClick={()=>onView(post)}>{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">{post.description}</p>

        {post.analysis && (
          <div className="mt-3 rounded-xl bg-muted/50 border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600"/> Gemini Vision</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.analysis.confidence>=90?"bg-emerald-500 text-white": post.analysis.confidence>=75?"bg-amber-500 text-white":"bg-zinc-500 text-white"}`}>{post.analysis.confidence}%</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs font-medium">{post.analysis.category}</Badge>
              <Badge variant="outline" className="text-xs">{post.analysis.item}</Badge>
              <Badge variant="outline" className="text-xs">{post.analysis.color}</Badge>
              {post.analysis.brand && post.analysis.brand!=="Unknown" && <Badge variant="outline" className="text-xs">{post.analysis.brand}</Badge>}
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{width:`${post.analysis.confidence}%`}}/>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <img src={post.author.avatar} alt={post.author.name} className="h-8 w-8 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium leading-none flex items-center gap-1">{post.author.name} {post.author.handle==="@guru.charan" && <BadgeCheck className="h-3.5 w-3.5 text-primary"/>}</div>
            <div className="text-xs text-muted-foreground">{post.author.handle} · {isFound?"Finder":"Owner"}</div>
          </div>
          {isFound ? (
            <Button size="sm" onClick={()=>onContact(post)} className="rounded-full font-semibold shrink-0"><MessageCircleMore className="h-4 w-4"/> Contact</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={()=>onView(post)} className="rounded-full font-semibold shrink-0">I found this</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
