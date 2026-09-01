import { useEffect, useState } from "react"
import { X, Upload, Sparkles, ShieldAlert, ShieldCheck, Loader2, Image as ImageIcon, AlertTriangle, Send, MapPin } from "lucide-react"
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

export function CreatePostDialog({ open, onOpenChange, onCreate }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (p: Post) => void
}) {
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
    setTitle("")
    setDescription("")
    setLocation("")
    setFiles([])
    setPreviews([])
    setAnalysis(null)
    setModeration(null)
    setBase64s([])
    setProgress("")
    setAnalyzing(false)
  }

  const handleFiles = async (fl: FileList | null) => {
    if (!fl) return
    const arr = Array.from(fl).slice(0, 4)
    setFiles(arr)
    setPreviews(arr.map((file) => URL.createObjectURL(file)))

    const b64s: string[] = []
    for (const file of arr) {
      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      b64s.push(data)
    }

    setBase64s(b64s)
    setAnalysis(null)
    setModeration(null)
  }

  const removeImage = (index: number) => {
    const nextFiles = [...files]
    const nextPreviews = [...previews]
    const nextBase64s = [...base64s]
    const removed = nextPreviews[index]

    nextFiles.splice(index, 1)
    nextPreviews.splice(index, 1)
    nextBase64s.splice(index, 1)

    if (removed?.startsWith("blob:")) URL.revokeObjectURL(removed)

    setFiles(nextFiles)
    setPreviews(nextPreviews)
    setBase64s(nextBase64s)
    setAnalysis(null)
    setModeration(null)
  }

  const runAnalysis = async () => {
    if (!files.length) return
    setAnalyzing(true)

    try {
      const result = await analyzeImages({
        files,
        base64s,
        hint: title + " " + description,
        onProgress: setProgress,
      })
      setAnalysis(result.analysis)
      setModeration(result.moderation)
      setProgress("")
    } catch (error: any) {
      setProgress(error.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const canPost = Boolean(
    title.trim() &&
    description.trim() &&
    location &&
    previews.length > 0
  )

  const handlePost = () => {
    if (!canPost) return

    const locLabel =
      VIT_LOCATIONS.find((item) => item.id === location)?.label ?? location

    const newPost: Post = {
      id: Date.now().toString(),
      type,
      title: title.trim(),
      description: description.trim(),
      images: base64s.length ? base64s : previews,
      location,
      locationLabel: locLabel,
      createdAt: new Date().toISOString(),
      author: {
        name: CURRENT_USER.name,
        handle: CURRENT_USER.handle,
        avatar: CURRENT_USER.avatar,
      },
      status: "open",
      analysis: analysis ?? undefined,
      moderation: moderation ?? undefined,
    }

    // App.tsx immediately inserts this post at the start of the card grid.
    onCreate(newPost)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) reset()
        onOpenChange(value)
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-[1180px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b bg-muted/20">
          <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <span className="h-10 w-10 rounded-xl bg-primary text-white grid place-items-center">
              <Upload className="h-5 w-5" />
            </span>
            Create Post
          </DialogTitle>
          <DialogDescription>
            Upload item images, add the VIT Chennai location, then post directly to the feed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-[1.05fr_1fr] max-h-[70vh] overflow-y-scroll overscroll-contain [scrollbar-gutter:stable]">
          {/* LEFT: images and AI analysis */}
          <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r space-y-5">
            <div>
              <Label>Images (up to 4) *</Label>
              <div className="mt-2">
                {previews.length === 0 ? (
                  <label className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/20 p-8 cursor-pointer hover:bg-muted/30 transition">
                    <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-sm font-medium">Click to upload images</div>
                    <div className="text-xs text-muted-foreground">PNG or JPG, up to 4 images</div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                  </label>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {previews.map((src, index) => (
                      <div key={src} className="relative group aspect-[4/3] rounded-xl overflow-hidden border bg-muted">
                        <img src={src} className="w-full h-full object-cover" alt={"preview " + (index + 1)} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white grid place-items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {previews.length < 4 && (
                      <label className="aspect-[4/3] rounded-xl border-2 border-dashed grid place-items-center cursor-pointer bg-muted/20 hover:bg-muted/30">
                        <div className="text-center text-primary">
                          <div className="text-3xl leading-none">+</div>
                          <div className="text-sm font-medium mt-1">Add more images</div>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(event) => handleFiles(event.target.files)}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Gemini Vision Analysis
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!previews.length || analyzing}
                  onClick={runAnalysis}
                  className="rounded-full"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    "Analyze Images"
                  )}
                </Button>
              </div>

              {progress && (
                <p className="text-xs text-muted-foreground mt-3 animate-pulse">{progress}</p>
              )}

              {moderation && !moderation.approved && (
                <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 flex gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-red-700 dark:text-red-400">Upload rejected</div>
                    <div className="text-sm text-red-600 dark:text-red-300/80">
                      {moderation.reason ?? "Failed moderation checks."}
                    </div>
                  </div>
                </div>
              )}

              {analysis && (
                <div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    {moderation?.approved ? "Approved — ready to post" : "Analysis complete"}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <Info label="Category" value={analysis.category} />
                    <Info label="Item" value={analysis.item} />
                    <Info label="Color" value={analysis.color} />
                    <Info label="Confidence" value={analysis.confidence + "%"} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {analysis.characteristics?.map((item: string) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>

                  {analysis.description && (
                    <p className="text-sm text-muted-foreground mt-3">{analysis.description}</p>
                  )}
                </div>
              )}
            </div>

            {moderation && !moderation.approved && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
                <AlertTriangle className="h-4 w-4" />
                You can replace the image and analyze it again.
              </div>
            )}
          </div>

          {/* RIGHT: post details */}
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <Label>Post Type *</Label>
              <Tabs value={type} onValueChange={(value) => setType(value as PostType)} className="mt-2">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="found">I Found Something</TabsTrigger>
                  <TabsTrigger value="lost">I Lost Something</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <Label>VIT Chennai Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="mt-2">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {VIT_LOCATIONS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Pink backpack"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the item, color, brand, and any distinguishing details..."
                rows={5}
                className="mt-2"
              />
            </div>

            <p className="text-xs text-muted-foreground text-right">* Required fields</p>
          </div>
        </div>

        {/* Always visible footer: Post button is deliberately on the bottom-left. */}
        <div className="p-4 sm:p-5 border-t bg-muted/20 flex items-center gap-3 justify-end">
          <Button
            type="button"
            disabled={!canPost}
            onClick={handlePost}
            className="rounded-full font-semibold px-5"
          >
            <Send className="h-4 w-4" />
            Post
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="rounded-lg border bg-background/70 p-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold mt-0.5">{value ?? "—"}</div>
    </div>
  )
}
