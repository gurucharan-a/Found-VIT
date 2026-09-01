import { MapPin, Clock, Sparkles, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Post } from "@/types"

export function PostDetail({ post, open, onOpenChange, onContact }: { post: Post | null; open:boolean; onOpenChange:(v:boolean)=>void; onContact:(p:Post)=>void }) {
  if (!post) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden gap-0">
        <div className="grid sm:grid-cols-[1.2fr_1fr] max-h-[85vh]">
          <div className="bg-muted overflow-y-auto max-h-[85vh]">
            <div className="aspect-[4/3] bg-black">
              <img src={post.images[0]} alt={post.title} className="w-full h-full object-contain" />
            </div>
            {post.images.length>1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {post.images.map((src,i)=><img key={i} src={src} className="h-20 w-20 rounded-xl object-cover border shrink-0" alt={`img ${i}`}/>)}
              </div>
            )}
          </div>
          <div className="p-5 flex flex-col overflow-y-auto">
            <DialogHeader className="text-left space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Badge variant={post.type==="found" ? "success":"warning"} className="uppercase tracking-wide">{post.type}</Badge>
                <span className="text-xs bg-muted px-2.5 py-1 rounded-full inline-flex items-center gap-1"><MapPin className="h-3 w-3"/>{post.locationLabel}</span>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3"/>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <DialogTitle className="text-xl leading-tight">{post.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{post.description}</p>

            {post.analysis && (
              <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary"/> Gemini Vision</div>
                <div className="flex items-center gap-2 mt-2 text-xs"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600"/> Confidence <span className="font-bold">{post.analysis.confidence}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1"><div className="h-full bg-primary" style={{width:`${post.analysis.confidence}%`}}/></div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge variant="secondary">{post.analysis.category}</Badge>
                  <Badge variant="outline">{post.analysis.item}</Badge>
                  <Badge variant="outline">{post.analysis.color}</Badge>
                  {post.analysis.brand && <Badge variant="outline">{post.analysis.brand}</Badge>}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">{post.analysis.characteristics.map(c=><Badge key={c} variant="secondary" className="text-xs font-normal">{c}</Badge>)}</div>
                <p className="text-xs text-muted-foreground mt-2">{post.analysis.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-4 p-3 rounded-xl border bg-card">
              <img src={post.author.avatar} className="h-10 w-10 rounded-full object-cover" alt={post.author.name}/>
              <div><div className="text-sm font-semibold">{post.author.name}</div><div className="text-xs text-muted-foreground">{post.author.handle}</div></div>
            </div>

            <div className="mt-auto pt-4 flex gap-2">
              {post.type==="found" ? <Button className="flex-1 rounded-full font-semibold" onClick={()=>onContact(post)}>Contact Finder</Button> : <Button variant="secondary" className="flex-1 rounded-full" onClick={()=>onContact(post)}>I Found This</Button>}
              <Button variant="outline" className="rounded-full" onClick={()=>onOpenChange(false)}>Close</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
