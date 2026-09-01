import { Search, Plus, Moon, Sun, MapPin, Sparkles, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VIT_LOCATIONS } from "@/data/locations"
import { CURRENT_USER } from "@/data/samplePosts"

export function Header({ search, setSearch, locationFilter, setLocationFilter, onCreate, theme, toggleTheme, onSearchFocus }: {
  search: string; setSearch: (v:string)=>void; locationFilter: string; setLocationFilter:(v:string)=>void; onCreate:()=>void; theme:"light"|"dark"; toggleTheme:()=>void; onSearchFocus?:()=>void
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6 h-[64px]">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">F@V</div>
            <div className="hidden sm:block">
              <div className="font-display font-extrabold leading-none text-[18px] tracking-tight">Found@VIT</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5 font-medium tracking-wide">VIT Chennai • Lost & Found</div>
            </div>
            <div className="sm:hidden font-display font-extrabold text-[16px]">Found@VIT</div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-[560px] relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e=>setSearch(e.target.value)} onFocus={onSearchFocus} placeholder="Describe what you lost — e.g. 'black titan watch AB1'" className="pl-9 pr-10 h-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1" />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[11px] bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-medium"><Sparkles className="h-3 w-3"/> AI Search</span>
          </div>

          {/* Location filter */}
          <div className="hidden sm:flex items-center gap-2">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[200px] h-10 rounded-full bg-muted/50 border-0"><MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground"/><SelectValue placeholder="All locations" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All VIT Locations</SelectItem>
                {VIT_LOCATIONS.map(l=> <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>{theme==="dark"?<Sun className="h-4 w-4"/>:<Moon className="h-4 w-4"/>}</Button>
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex"><Bell className="h-4 w-4"/><span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full hidden"/></Button>
            <Button onClick={onCreate} className="rounded-full h-10 px-4 sm:px-5 font-semibold shadow-md"><Plus className="h-4 w-4"/> <span className="hidden sm:inline">Post Item</span><span className="sm:hidden">Post</span></Button>
            <img src={CURRENT_USER.avatar} alt="you" className="h-9 w-9 rounded-full object-cover border-2 border-primary/20 hidden sm:block" />
          </div>
        </div>
        {/* mobile search */}
        <div className="md:hidden pb-3 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search lost items..." className="pl-9 h-10 rounded-full bg-muted/50 border-0" />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[44px] h-10 rounded-full bg-muted/50 border-0 p-0 justify-center"><MapPin className="h-4 w-4"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {VIT_LOCATIONS.map(l=> <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
