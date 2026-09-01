import { useState } from "react"
import { Send, Shield, Phone, Mail, CheckCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Post } from "@/types"
import { CURRENT_USER } from "@/data/samplePosts"

export function ContactModal({ post, open, onOpenChange }: { post: Post | null; open: boolean; onOpenChange:(v:boolean)=>void }) {
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState("")
  if (!post) return null
  return (
    <Dialog open={open} onOpenChange={o=>{ onOpenChange(o); if(!o) setTimeout(()=>setSent(false),300)}}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Contact Finder</DialogTitle>
          <p className="text-sm text-muted-foreground">Mock chat — no backend. Message goes to <span className="font-medium text-foreground">{post.author.name}</span> about <span className="font-medium">{post.title}</span></p>
        </DialogHeader>
        {!sent ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/50 border p-3 flex items-center gap-3">
              <img src={post.author.avatar} className="h-10 w-10 rounded-full object-cover" alt={post.author.name} />
              <div className="flex-1">
                <div className="text-sm font-semibold">{post.author.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Mail className="h-3 w-3"/> {post.author.handle}@vit.ac.in · <Phone className="h-3 w-3"/> +91 9•••• ••123</div>
              </div>
              <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full font-medium flex items-center gap-1"><Shield className="h-3 w-3"/> Verified VIT</span>
            </div>

            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm p-3 text-sm ml-8">Hi! I found this near {post.locationLabel}. Is this yours? I can meet at the security desk.</div>
              <div className="bg-muted rounded-2xl rounded-bl-sm p-3 text-sm mr-8">Hi {CURRENT_USER.name.split(" ")[0]}! Yes — that's mine. Can we meet at SJT gate at 5pm? I can show my ID.</div>
            </div>

            <div className="flex gap-2">
              <Input placeholder="Type a message..." value={msg} onChange={e=>setMsg(e.target.value)} className="rounded-full" onKeyDown={e=>{ if(e.key==="Enter" && msg.trim()) setSent(true)}} />
              <Button className="rounded-full shrink-0" disabled={!msg.trim()} onClick={()=>setSent(true)}><Send className="h-4 w-4"/></Button>
            </div>
            <Textarea placeholder="Add proof — e.g. describe a scratch, wallpaper, or last used location" rows={2} value={msg} onChange={e=>setMsg(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={()=>setSent(true)}>Send Request</Button>
              <Button className="flex-1 rounded-full" onClick={()=>setSent(true)}>Start Mock Chat</Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Demo only — messages are not sent. Claim flow would verify ownership via Gemini characteristics.</p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-500 text-white grid place-items-center mx-auto"><CheckCheck className="h-7 w-7"/></div>
            <div className="font-semibold mt-3">Request sent!</div>
            <div className="text-sm text-muted-foreground mt-1">{post.author.name} will be notified. Check your VIT email for updates.</div>
            <Button className="mt-4 rounded-full" onClick={()=>onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
