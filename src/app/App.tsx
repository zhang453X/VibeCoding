import { useState, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  QrCode,
  Image,
  Video,
  FileText,
  Phone,
  Star,
  Link,
  Settings,
  ArrowLeft,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Type,
  Palette,
  LayoutTemplate,
  Share2,
  ChevronRight,
  Check,
  X,
  Copy,
  ExternalLink,
  Play,
  FolderOpen,
  Search,
  ImageIcon,
  Film,
  CheckCircle2,
} from "lucide-react";

// ─── Media Library ───────────────────────────────────────────────────────────

type AssetType = "image" | "video" | "culture" | "story";

interface Asset {
  id: string;
  type: AssetType;
  url: string;
  thumb: string;
  name: string;
  size: string;
  title?: string;
  content?: string;
  category?: string;
}

const MEDIA_ASSETS: Asset[] = [

  { id: "c1", type: "culture", url: "", thumb: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=150&fit=crop&auto=format", name: "品牌初心 · 山野共生", size: "企业文化", title: "山野共生，长期主义", category: "企业文化", content: "我们相信好产品来自对土地的尊重。云岭茶业与勐海十二个古茶园建立长期共护机制，坚持少采、手作、可追溯，让每一片茶叶都保留山野气息，也让每一位参与者获得稳定而体面的回报。" },
  { id: "c2", type: "culture", url: "", thumb: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=200&h=150&fit=crop&auto=format", name: "团队文化 · 匠心传承", size: "企业文化", title: "把复杂留给自己，把安心交给客户", category: "企业文化", content: "从采摘标准、摊晾时长到仓储温湿度，我们把每个环节拆解成可复核的流程。经验丰富的制茶师傅带领年轻团队共同记录、试饮和复盘，让传统工艺不只依赖口传，也能持续稳定地传承。" },
  { id: "s1", type: "story", url: "", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop&auto=format", name: "班章古树普洱故事", size: "商品故事", title: "班章古树普洱", category: "商品故事", content: "这款茶来自海拔约1800米的古茶园，原料采自树龄三百年以上的乔木古茶树。春茶季只选一芽二叶，经传统晒青和五年干仓陈化，茶汤入口厚实，兰香清晰，回甘绵长，适合重要客户礼赠与长期收藏。" },
  { id: "s2", type: "story", url: "", thumb: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=150&fit=crop&auto=format", name: "高山茶礼盒故事", size: "商品故事", title: "高山茶礼盒", category: "商品故事", content: "礼盒以四款代表性山头茶组成，从清润花香到醇厚陈韵形成完整品鉴路径。包装采用可回收纸材与棉麻内衬，适合企业伴手礼、节庆福利和商务拜访，传递克制、体面且有记忆点的品牌心意。" },  { id: "a1", type: "image", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop&auto=format", name: "古茶园全景.jpg", size: "2.3 MB" },
  { id: "a2", type: "image", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&h=150&fit=crop&auto=format", name: "手工采摘.jpg", size: "1.8 MB" },
  { id: "a3", type: "image", url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=150&fit=crop&auto=format", name: "传统工艺.jpg", size: "3.1 MB" },
  { id: "a4", type: "image", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=150&fit=crop&auto=format", name: "品茗时光.jpg", size: "1.5 MB" },
  { id: "a5", type: "image", url: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=150&fit=crop&auto=format", name: "茶园晨雾.jpg", size: "4.2 MB" },
  { id: "a6", type: "image", url: "https://images.unsplash.com/photo-1467663736408-9d90b10d3bca?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1467663736408-9d90b10d3bca?w=200&h=150&fit=crop&auto=format", name: "产品展示.jpg", size: "2.7 MB" },
  { id: "a7", type: "image", url: "https://images.unsplash.com/photo-1565039267-0d3e97a408c5?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1565039267-0d3e97a408c5?w=200&h=150&fit=crop&auto=format", name: "茶叶特写.jpg", size: "1.9 MB" },
  { id: "a8", type: "image", url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=150&fit=crop&auto=format", name: "包装设计.jpg", size: "2.1 MB" },
  { id: "a9", type: "image", url: "https://images.unsplash.com/photo-1531913364716-793f2c6b9e0d?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1531913364716-793f2c6b9e0d?w=200&h=150&fit=crop&auto=format", name: "茶道器具.jpg", size: "3.4 MB" },
  { id: "a10", type: "image", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&auto=format", thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=150&fit=crop&auto=format", name: "品牌标志.jpg", size: "0.8 MB" },
  { id: "v1", type: "video", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", thumb: "https://images.unsplash.com/photo-1601388352547-2802c6a8a127?w=200&h=150&fit=crop&auto=format", name: "品牌宣传片.mp4", size: "38 MB" },
  { id: "v2", type: "video", url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4", thumb: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=150&fit=crop&auto=format", name: "茶园纪录片.mp4", size: "62 MB" },
  { id: "v3", type: "video", url: "https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4", thumb: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=150&fit=crop&auto=format", name: "制茶工艺.mp4", size: "44 MB" },
];

function MediaLibraryModal({
  open,
  accept,
  onSelect,
  onClose,
  multiple,
}: {
  open: boolean;
  accept: AssetType | "all";
  onSelect: (assets: Asset[]) => void;
  onClose: () => void;
  multiple?: boolean;
}) {
  const [tab, setTab] = useState<"all" | AssetType>(accept === "all" ? "all" : accept);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  if (!open) return null;

  const filtered = MEDIA_ASSETS.filter((a) => {
    const typeOk = tab === "all" ? true : a.type === tab;
    const acceptOk = accept === "all" ? true : a.type === accept;
    const queryOk = a.name.toLowerCase().includes(query.toLowerCase());
    return typeOk && acceptOk && queryOk;
  });

  const toggle = (id: string) => {
    if (multiple) {
      setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    } else {
      setSelected([id]);
    }
  };

  const confirm = () => {
    const assets = MEDIA_ASSETS.filter((a) => selected.includes(a.id));
    onSelect(assets);
    setSelected([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-[680px] max-h-[80vh] flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">素材库</p>
              <p className="text-[10px] text-muted-foreground">{MEDIA_ASSETS.filter((a) => accept === "all" || a.type === accept).length} 个素材</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0">
          {/* Type tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {([
              { id: "all", label: "全部" },
              { id: "image", label: "图片", icon: ImageIcon },
              { id: "video", label: "视频", icon: Film },
              { id: "culture", label: "企业文化", icon: FileText },
              { id: "story", label: "商品故事", icon: Star },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all ${
                  tab === t.id ? "bg-card shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {"icon" in t && t.icon && <t.icon size={11} />}
                {t.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <Search size={12} className="text-muted-foreground flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
              placeholder="搜索素材名称..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {/* Upload button */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-primary rounded-lg hover:bg-secondary/70 transition-colors flex-shrink-0">
            <Upload size={12} />
            上传素材
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <FolderOpen size={32} className="opacity-30" />
              <p className="text-xs">没有匹配的素材</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filtered.map((asset) => {
                const isSelected = selected.includes(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggle(asset.id)}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected ? "border-primary shadow-md" : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className="bg-muted aspect-[4/3] relative overflow-hidden">
                      <img src={asset.thumb} alt={asset.name} className="w-full h-full object-cover" />
                      {(asset.type === "culture" || asset.type === "story") && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-2 flex items-end">
                          <p className="text-[10px] leading-snug text-white font-medium line-clamp-3">{asset.title}</p>
                        </div>
                      )}
                      {asset.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                            <Play size={12} className="text-foreground ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 size={22} className="text-primary drop-shadow" />
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[11px] font-medium text-foreground truncate">{asset.name}</p>
                      <p className="text-[10px] text-muted-foreground">{asset.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selected.length > 0 && (() => {
          const current = MEDIA_ASSETS.find((a) => a.id === selected[selected.length - 1]);
          if (!current) return null;
          return (
            <div className="px-5 py-3 border-t border-border bg-muted/30 flex-shrink-0">
              <div className="flex items-start gap-3">
                <img src={current.thumb} alt={current.name} className="w-16 h-12 rounded-lg object-cover bg-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{current.title || current.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{current.category || current.size}</p>
                  {current.content && <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">{current.content}</p>}
                  {current.type === "video" && <p className="text-[11px] text-muted-foreground mt-1 truncate">视频地址：{current.url}</p>}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/40 flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            {selected.length > 0 ? `已选择 ${selected.length} 个素材` : "点击选择素材"}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              取消
            </button>
            <button
              onClick={confirm}
              disabled={selected.length === 0}
              className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              确认使用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ModuleType =
  | "brand_header"
  | "article"
  | "gallery"
  | "video"
  | "product_story"
  | "contact"
  | "testimonial"
  | "cta";

interface BaseModule {
  id: string;
  type: ModuleType;
  visible: boolean;
}

interface BrandHeaderModule extends BaseModule {
  type: "brand_header";
  logo: string;
  companyName: string;
  tagline: string;
  bgColor: string;
  textColor: string;
  bgImage: string;
  logoShape: "circle" | "rounded" | "square";
  layout: "center" | "left";
  showTagBadge: boolean;
}

interface ArticleModule extends BaseModule {
  type: "article";
  title: string;
  content: string;
  align: "left" | "center" | "right";
  showDivider: boolean;
  titleColor: string;
  contentColor: string;
  bgColor: string;
  fontSize: "small" | "medium" | "large";
  paddingSize: "compact" | "normal" | "spacious";
  bold: boolean;
  italic: boolean;
}

interface GalleryModule extends BaseModule {
  type: "gallery";
  title: string;
  layout: "grid" | "masonry" | "carousel";
  images: { url: string; caption: string }[];
  columns: 2 | 3 | 4;
  gap: "tight" | "normal" | "loose";
  showCaption: boolean;
  aspectRatio: "square" | "4:3" | "16:9";
}

interface VideoModule extends BaseModule {
  type: "video";
  title: string;
  videoUrl: string;
  thumbnail: string;
  autoplay: boolean;
  showTitle: boolean;
  description: string;
  loop: boolean;
  muted: boolean;
  aspectRatio: "16:9" | "4:3" | "9:16";
}

interface ProductStoryModule extends BaseModule {
  type: "product_story";
  title: string;
  subtitle: string;
  content: string;
  image: string;
  imagePosition: "left" | "right" | "top";
  tag: string;
  price: string;
  originalPrice: string;
  tagColor: string;
  showBuyButton: boolean;
  buyButtonText: string;
  buyButtonUrl: string;
  bgColor: string;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
}

interface ContactModule extends BaseModule {
  type: "contact";
  phone: string;
  email: string;
  address: string;
  wechat: string;
  showMap: boolean;
  website: string;
  businessHours: string;
  showCallButton: boolean;
  buttonText: string;
}

interface TestimonialModule extends BaseModule {
  type: "testimonial";
  title: string;
  items: { name: string; role: string; content: string; avatar: string; rating: number }[];
  layout: "list" | "grid";
  showRating: boolean;
  cardStyle: "plain" | "bordered" | "filled";
}

interface CtaModule extends BaseModule {
  type: "cta";
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  bgColor: string;
  buttonStyle: "filled" | "outline" | "ghost";
  align: "left" | "center" | "right";
  bgImage: string;
  textColor: string;
}

type Module =
  | BrandHeaderModule
  | ArticleModule
  | GalleryModule
  | VideoModule
  | ProductStoryModule
  | ContactModule
  | TestimonialModule
  | CtaModule;

// ─── Default Data ─────────────────────────────────────────────────────────────

const defaultModules: Module[] = [
  {
    id: "m1",
    type: "brand_header",
    visible: true,
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop&auto=format",
    companyName: "云岭茶业",
    tagline: "源自云南高山，传承百年匠心",
    bgColor: "#1a3a2a",
    textColor: "#ffffff",
    bgImage: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=400&fit=crop&auto=format",
    logoShape: "rounded",
    layout: "center",
    showTagBadge: true,
  },
  {
    id: "m2",
    type: "article",
    visible: true,
    title: "企业文化",
    content:
      "云岭茶业创立于1987年，深耕云南普洱茶产业三十余年。我们坚守传统工艺，精选海拔1800米以上古茶园原料，以匠心制作每一片茶叶。秉承「山野之灵，杯中之韵」的品牌理念，将大自然的馈赠带到每一位爱茶人的生活中。",
    align: "left",
    showDivider: true,
    titleColor: "#1A1B2E",
    contentColor: "#6B7280",
    bgColor: "#ffffff",
    fontSize: "medium",
    paddingSize: "normal",
    bold: false,
    italic: false,
  },
  {
    id: "m3",
    type: "gallery",
    visible: true,
    title: "品牌印象",
    layout: "grid",
    images: [
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format", caption: "古茶园" },
      { url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=300&fit=crop&auto=format", caption: "手工采摘" },
      { url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format", caption: "传统工艺" },
      { url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&auto=format", caption: "品茗时光" },
    ],
    columns: 2,
    gap: "normal",
    showCaption: true,
    aspectRatio: "4:3",
  },
  {
    id: "m4",
    type: "video",
    visible: true,
    title: "探秘云岭古茶园",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=450&fit=crop&auto=format",
    autoplay: false,
    showTitle: true,
    description: "带您走进神秘的云岭古茶园，探寻百年制茶工艺的奥秘。",
    loop: false,
    muted: false,
    aspectRatio: "16:9",
  },
  {
    id: "m5",
    type: "product_story",
    visible: true,
    title: "班章古树普洱",
    subtitle: "荣获2023年度最佳普洱茶金奖",
    tag: "明星产品",
    content:
      "班章古树普洱采自树龄三百年以上的野生乔木古茶树，每年仅产出200公斤。茶叶经过精挑细选，历经萎凋、杀青、揉捻、晒干等传统工序，再经五年陈化，呈现出醇厚霸气的茶气，回甘持久，兰香幽远。",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=500&fit=crop&auto=format",
    imagePosition: "right",
    price: "¥880",
    originalPrice: "¥1280",
    tagColor: "#10b981",
    showBuyButton: true,
    buyButtonText: "立即购买",
    buyButtonUrl: "#",
    bgColor: "#ffffff",
    align: "left",
    bold: false,
    italic: false,
  },
  {
    id: "m6",
    type: "testimonial",
    visible: true,
    title: "客户评价",
    items: [
      {
        name: "王建国",
        role: "茶文化研究者",
        content: "喝了二十年普洱，云岭的班章古树是我见过工艺最扎实的，回甘极好，值得收藏。",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format",
        rating: 5,
      },
      {
        name: "李晓梅",
        role: "企业采购经理",
        content: "每年都在云岭采购礼盒，包装精美，茶品质稳定，客户反馈一直很好，是我们的长期供应商。",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
        rating: 5,
      },
    ],
    layout: "list",
    showRating: true,
    cardStyle: "bordered",
  },
  {
    id: "m7",
    type: "contact",
    visible: true,
    phone: "400-888-6688",
    email: "service@yunling-tea.com",
    address: "云南省西双版纳傣族自治州勐海县茶产业园A区18号",
    wechat: "yunling_tea",
    showMap: true,
    website: "www.yunling-tea.com",
    businessHours: "周一至周日 09:00-18:00",
    showCallButton: true,
    buttonText: "立即咨询",
  },
  {
    id: "m8",
    type: "cta",
    visible: true,
    title: "预约品鉴",
    subtitle: "免费寄送10克试饮装，感受云岭茶香",
    buttonText: "立即预约",
    buttonUrl: "https://yunling-tea.com/reserve",
    bgColor: "#1a3a2a",
    buttonStyle: "filled",
    align: "center",
    bgImage: "",
    textColor: "#ffffff",
  },
];

const MODULE_ICONS: Record<ModuleType, typeof QrCode> = {
  brand_header: LayoutTemplate,
  article: FileText,
  gallery: Image,
  video: Video,
  product_story: Star,
  contact: Phone,
  testimonial: Star,
  cta: Link,
};

const MODULE_LABELS: Record<ModuleType, string> = {
  brand_header: "品牌头部",
  article: "企业文化",
  gallery: "图片画廊",
  video: "视频模块",
  product_story: "商品故事",
  contact: "联系方式",
  testimonial: "客户评价",
  cta: "行动召唤",
};

const MODULE_COLORS: Record<ModuleType, string> = {
  brand_header: "#6366f1",
  article: "#0ea5e9",
  gallery: "#f59e0b",
  video: "#ef4444",
  product_story: "#10b981",
  contact: "#8b5cf6",
  testimonial: "#f97316",
  cta: "#ec4899",
};

// ─── Module Editors ───────────────────────────────────────────────────────────

function BrandHeaderEditor({ mod, onChange }: { mod: BrandHeaderModule; onChange: (m: BrandHeaderModule) => void }) {
  const [logoOpen, setLogoOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  return (
    <div className="space-y-4">
      <MediaLibraryModal open={logoOpen} accept="image" onSelect={([asset]) => onChange({ ...mod, logo: asset.url })} onClose={() => setLogoOpen(false)} />
      <MediaLibraryModal open={bgOpen} accept="image" onSelect={([asset]) => onChange({ ...mod, bgImage: asset.url })} onClose={() => setBgOpen(false)} />
      <FormField label="品牌 Logo 图片">
        <div className="flex items-center gap-3 p-2 bg-muted rounded-xl">
          <img src={mod.logo} alt="品牌 Logo" className="w-14 h-14 object-cover rounded-xl bg-card" />
          <div className="flex-1 min-w-0">
            <input className="input-field text-xs" value={mod.logo} onChange={(e) => onChange({ ...mod, logo: e.target.value })} placeholder="Logo 图片 URL" />
            <button onClick={() => setLogoOpen(true)} className="mt-2 btn-ghost text-xs justify-center gap-1.5 !border-primary/30 !text-primary"><FolderOpen size={12} />从素材库选择 Logo</button>
          </div>
        </div>
      </FormField>
      <FormField label="企业名称"><input className="input-field" value={mod.companyName} onChange={(e) => onChange({ ...mod, companyName: e.target.value })} /></FormField>
      <FormField label="品牌标语"><input className="input-field" value={mod.tagline} onChange={(e) => onChange({ ...mod, tagline: e.target.value })} /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="背景色"><div className="flex items-center gap-2"><input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.bgColor} onChange={(e) => onChange({ ...mod, bgColor: e.target.value })} /><input className="input-field flex-1" value={mod.bgColor} onChange={(e) => onChange({ ...mod, bgColor: e.target.value })} /></div></FormField>
        <FormField label="文字色"><div className="flex items-center gap-2"><input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.textColor} onChange={(e) => onChange({ ...mod, textColor: e.target.value })} /><input className="input-field flex-1" value={mod.textColor} onChange={(e) => onChange({ ...mod, textColor: e.target.value })} /></div></FormField>
      </div>
      <FormField label="头图背景"><div className="flex gap-2"><input className="input-field flex-1" value={mod.bgImage} onChange={(e) => onChange({ ...mod, bgImage: e.target.value })} placeholder="https://..." /><button onClick={() => setBgOpen(true)} className="btn-icon" title="从素材库选择背景"><FolderOpen size={14} /></button></div></FormField>
      <FormField label="Logo 形状"><div className="flex gap-2">{([{ value: "circle", label: "圆形" }, { value: "rounded", label: "圆角" }, { value: "square", label: "方形" }] as const).map((opt) => <button key={opt.value} onClick={() => onChange({ ...mod, logoShape: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.logoShape === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>)}</div></FormField>
      <FormField label="内容布局"><div className="flex gap-2">{([{ value: "center", label: "居中" }, { value: "left", label: "左对齐" }] as const).map((opt) => <button key={opt.value} onClick={() => onChange({ ...mod, layout: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.layout === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>)}</div></FormField>
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">显示“官方认证”角标</span><Toggle value={mod.showTagBadge} onChange={(v) => onChange({ ...mod, showTagBadge: v })} /></div>
    </div>
  );
}

function ArticleEditor({ mod, onChange }: { mod: ArticleModule; onChange: (m: ArticleModule) => void }) {
  const [cultureOpen, setCultureOpen] = useState(false);
  const formatContent = (mark: "bold" | "italic") => {
    if (mark === "bold") onChange({ ...mod, bold: !mod.bold });
    if (mark === "italic") onChange({ ...mod, italic: !mod.italic });
  };
  return (
    <div className="space-y-4">
      <MediaLibraryModal open={cultureOpen} accept="culture" onSelect={([asset]) => onChange({ ...mod, title: asset.title || mod.title, content: asset.content || mod.content })} onClose={() => setCultureOpen(false)} />
      <FormField label="标题"><input className="input-field" value={mod.title} onChange={(e) => onChange({ ...mod, title: e.target.value })} /></FormField>
      <FormField label="企业文化内容">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-1 px-2 py-1.5 bg-muted border-b border-border">
            <button onClick={() => formatContent("bold")} className={`p-1.5 rounded transition-colors ${mod.bold ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"}`} title="粗体"><Bold size={12} /></button>
            <button onClick={() => formatContent("italic")} className={`p-1.5 rounded transition-colors ${mod.italic ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"}`} title="斜体"><Italic size={12} /></button>
            <div className="w-px h-4 bg-border mx-1" />
            {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => { const aligns: ("left" | "center" | "right")[] = ["left", "center", "right"]; return <button key={i} className={`p-1.5 rounded transition-colors ${mod.align === aligns[i] ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"}`} onClick={() => onChange({ ...mod, align: aligns[i] })}><Icon size={12} /></button>; })}
            <div className="w-px h-4 bg-border mx-1" />
            <button onClick={() => setCultureOpen(true)} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"><FolderOpen size={11} />企业文化素材</button>
          </div>
          <textarea className="w-full px-3 py-2.5 text-sm bg-card text-foreground resize-none outline-none min-h-[150px]" value={mod.content} onChange={(e) => onChange({ ...mod, content: e.target.value })} />
        </div>
      </FormField>
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">显示分割线</span><Toggle value={mod.showDivider} onChange={(v) => onChange({ ...mod, showDivider: v })} /></div>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="标题颜色"><div className="flex items-center gap-2"><input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.titleColor} onChange={(e) => onChange({ ...mod, titleColor: e.target.value })} /><input className="input-field flex-1" value={mod.titleColor} onChange={(e) => onChange({ ...mod, titleColor: e.target.value })} /></div></FormField>
        <FormField label="正文颜色"><div className="flex items-center gap-2"><input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.contentColor} onChange={(e) => onChange({ ...mod, contentColor: e.target.value })} /><input className="input-field flex-1" value={mod.contentColor} onChange={(e) => onChange({ ...mod, contentColor: e.target.value })} /></div></FormField>
        <FormField label="背景颜色"><div className="flex items-center gap-2"><input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.bgColor} onChange={(e) => onChange({ ...mod, bgColor: e.target.value })} /><input className="input-field flex-1" value={mod.bgColor} onChange={(e) => onChange({ ...mod, bgColor: e.target.value })} /></div></FormField>
      </div>
      <FormField label="字体大小"><div className="flex gap-2">{([{ value: "small", label: "小" }, { value: "medium", label: "中" }, { value: "large", label: "大" }] as const).map((opt) => <button key={opt.value} onClick={() => onChange({ ...mod, fontSize: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.fontSize === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>)}</div></FormField>
      <FormField label="内距大小"><div className="flex gap-2">{([{ value: "compact", label: "紧凑" }, { value: "normal", label: "标准" }, { value: "spacious", label: "宽松" }] as const).map((opt) => <button key={opt.value} onClick={() => onChange({ ...mod, paddingSize: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.paddingSize === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>)}</div></FormField>
    </div>
  );
}

function GalleryEditor({ mod, onChange }: { mod: GalleryModule; onChange: (m: GalleryModule) => void }) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);
  const layouts: { value: "grid" | "masonry" | "carousel"; label: string }[] = [
    { value: "grid", label: "网格" }, { value: "masonry", label: "瀑布流" }, { value: "carousel", label: "轮播" },
  ];
  const moveImage = (from: number, to: number) => {
    if (from === to) return;
    const imgs = [...mod.images];
    const [item] = imgs.splice(from, 1);
    imgs.splice(to, 0, item);
    onChange({ ...mod, images: imgs });
  };
  return (
    <div className="space-y-4">
      <MediaLibraryModal open={mediaOpen} accept="image" multiple onSelect={(assets) => { const newImgs = assets.map((a) => ({ url: a.url, caption: a.name.replace(/\.[^.]+$/, "") })); onChange({ ...mod, images: [...mod.images, ...newImgs] }); }} onClose={() => setMediaOpen(false)} />
      <FormField label="标题"><input className="input-field" value={mod.title} onChange={(e) => onChange({ ...mod, title: e.target.value })} /></FormField>
      <FormField label="布局方式"><div className="flex gap-2">{layouts.map((l) => <button key={l.value} onClick={() => onChange({ ...mod, layout: l.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.layout === l.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{l.label}</button>)}</div></FormField>
      {mod.layout !== "carousel" && <FormField label="列数"><div className="flex gap-2">{([{ value: 2, label: "2列" }, { value: 3, label: "3列" }, { value: 4, label: "4列" }] as const).map((opt) => <button key={opt.value} onClick={() => onChange({ ...mod, columns: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.columns === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>)}</div></FormField>}
      <FormField label="间距"><div className="flex gap-2">{([{ value: "tight", label: "紧凑" }, { value: "normal", label: "标准" }, { value: "loose", label: "宽松" }] as const).map((opt) => <button key={opt.value} onClick={() => onChange({ ...mod, gap: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.gap === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>)}</div></FormField>
      {mod.layout === "grid" && <FormField label="图片比例"><div className="flex gap-2">{([{ value: "square", label: "正方" }, { value: "4:3", label: "4:3" }, { value: "16:9", label: "16:9" }] as const).map((opt) => <button key={opt.value} onClick={() => onChange({ ...mod, aspectRatio: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.aspectRatio === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>)}</div></FormField>}
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">显示标注</span><Toggle value={mod.showCaption} onChange={(v) => onChange({ ...mod, showCaption: v })} /></div>
      <FormField label={`图片 (${mod.images.length}张，可拖拽排序)`}>
        <div className="space-y-2">
          {mod.images.map((img, i) => (
            <div key={`${img.url}-${i}`} draggable onDragStart={() => setDragImageIndex(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragImageIndex !== null) moveImage(dragImageIndex, i); setDragImageIndex(null); }} onDragEnd={() => setDragImageIndex(null)} className={`flex items-center gap-2 p-2 bg-muted rounded-lg border ${dragImageIndex === i ? "border-primary opacity-70" : "border-transparent"}`}>
              <GripVertical size={14} className="text-muted-foreground cursor-grab" />
              <img src={img.url} alt={img.caption} className="w-12 h-9 object-cover rounded" />
              <input className="input-field flex-1 text-xs" placeholder="图片标注" value={img.caption} onChange={(e) => { const imgs = [...mod.images]; imgs[i] = { ...imgs[i], caption: e.target.value }; onChange({ ...mod, images: imgs }); }} />
              <button onClick={() => onChange({ ...mod, images: mod.images.filter((_, j) => j !== i) })} className="p-1 hover:text-destructive transition-colors"><X size={12} /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 text-xs justify-center gap-1.5"><Upload size={12} />上传添加</button>
            <button onClick={() => setMediaOpen(true)} className="btn-ghost flex-1 text-xs justify-center gap-1.5 !text-primary !border-primary/30 hover:!bg-primary/5"><FolderOpen size={12} />图片素材库</button>
          </div>
        </div>
      </FormField>
    </div>
  );
}

function VideoEditor({ mod, onChange }: { mod: VideoModule; onChange: (m: VideoModule) => void }) {
  const [mediaOpenVideo, setMediaOpenVideo] = useState(false);
  const [mediaOpenThumb, setMediaOpenThumb] = useState(false);
  return (
    <div className="space-y-4">
      <MediaLibraryModal
        open={mediaOpenVideo}
        accept="video"
        onSelect={([asset]) => onChange({ ...mod, videoUrl: asset.url, thumbnail: asset.thumb })}
        onClose={() => setMediaOpenVideo(false)}
      />
      <MediaLibraryModal
        open={mediaOpenThumb}
        accept="image"
        onSelect={([asset]) => onChange({ ...mod, thumbnail: asset.url })}
        onClose={() => setMediaOpenThumb(false)}
      />
      <FormField label="视频标题">
        <input
          className="input-field"
          value={mod.title}
          onChange={(e) => onChange({ ...mod, title: e.target.value })}
        />
      </FormField>
      <FormField label="视频地址 (YouTube/Vimeo/直链)">
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            value={mod.videoUrl}
            onChange={(e) => onChange({ ...mod, videoUrl: e.target.value })}
            placeholder="https://..."
          />
          <button
            onClick={() => setMediaOpenVideo(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex-shrink-0"
          >
            <FolderOpen size={12} />
            素材库
          </button>
        </div>
      </FormField>
      <FormField label="封面图片">
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            value={mod.thumbnail}
            onChange={(e) => onChange({ ...mod, thumbnail: e.target.value })}
            placeholder="https://..."
          />
          <button
            onClick={() => setMediaOpenThumb(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex-shrink-0"
          >
            <FolderOpen size={12} />
            素材库
          </button>
        </div>
        {mod.thumbnail && (
          <div className="mt-2 h-20 rounded-lg overflow-hidden bg-muted">
            <img src={mod.thumbnail} alt="封面预览" className="w-full h-full object-cover" />
          </div>
        )}
      </FormField>
      <FormField label="视频描述">
        <textarea
          className="input-field resize-none"
          rows={3}
          value={mod.description}
          onChange={(e) => onChange({ ...mod, description: e.target.value })}
          placeholder="视频描述..."
        />
      </FormField>
      <FormField label="视频比例">
        <div className="flex gap-2">
          {([{ value: "16:9", label: "横屏16:9" }, { value: "4:3", label: "标准4:3" }, { value: "9:16", label: "竖屏9:16" }] as const).map((opt) => (
            <button key={opt.value} onClick={() => onChange({ ...mod, aspectRatio: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.aspectRatio === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>
          ))}
        </div>
      </FormField>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">自动播放</span>
        <Toggle value={mod.autoplay} onChange={(v) => onChange({ ...mod, autoplay: v })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">循环播放</span>
        <Toggle value={mod.loop} onChange={(v) => onChange({ ...mod, loop: v })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">静音</span>
        <Toggle value={mod.muted} onChange={(v) => onChange({ ...mod, muted: v })} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">显示标题</span>
        <Toggle value={mod.showTitle} onChange={(v) => onChange({ ...mod, showTitle: v })} />
      </div>
    </div>
  );
}

function ProductStoryEditor({ mod, onChange }: { mod: ProductStoryModule; onChange: (m: ProductStoryModule) => void }) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const positions: { value: "left" | "right" | "top"; label: string }[] = [{ value: "left", label: "图左" }, { value: "right", label: "图右" }, { value: "top", label: "图上" }];
  return (
    <div className="space-y-4">
      <MediaLibraryModal open={mediaOpen} accept="image" onSelect={([asset]) => onChange({ ...mod, image: asset.url })} onClose={() => setMediaOpen(false)} />
      <MediaLibraryModal open={storyOpen} accept="story" onSelect={([asset]) => onChange({ ...mod, title: asset.title || mod.title, content: asset.content || mod.content })} onClose={() => setStoryOpen(false)} />
      <FormField label="标签"><input className="input-field" value={mod.tag} onChange={(e) => onChange({ ...mod, tag: e.target.value })} placeholder="如：明星产品、限量发售" /></FormField>
      <FormField label="商品名称"><input className="input-field" value={mod.title} onChange={(e) => onChange({ ...mod, title: e.target.value })} /></FormField>
      <FormField label="副标题"><input className="input-field" value={mod.subtitle} onChange={(e) => onChange({ ...mod, subtitle: e.target.value })} /></FormField>
      <FormField label="故事内容">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-1 px-2 py-1.5 bg-muted border-b border-border">
            <button onClick={() => onChange({ ...mod, bold: !mod.bold })} className={`p-1.5 rounded transition-colors ${mod.bold ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"}`} title="粗体"><Bold size={12} /></button>
            <button onClick={() => onChange({ ...mod, italic: !mod.italic })} className={`p-1.5 rounded transition-colors ${mod.italic ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"}`} title="斜体"><Italic size={12} /></button>
            <div className="w-px h-4 bg-border mx-1" />
            {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => { const aligns: ("left" | "center" | "right")[] = ["left", "center", "right"]; return <button key={i} className={`p-1.5 rounded transition-colors ${mod.align === aligns[i] ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"}`} onClick={() => onChange({ ...mod, align: aligns[i] })}><Icon size={12} /></button>; })}
            <div className="w-px h-4 bg-border mx-1" />
            <button onClick={() => setStoryOpen(true)} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"><FolderOpen size={11} />商品故事素材</button>
          </div>
          <textarea className="w-full px-3 py-2.5 text-sm bg-card text-foreground resize-none outline-none min-h-[130px]" value={mod.content} onChange={(e) => onChange({ ...mod, content: e.target.value })} />
        </div>
      </FormField>
      <FormField label="商品图片"><div className="flex gap-2"><input className="input-field flex-1" value={mod.image} onChange={(e) => onChange({ ...mod, image: e.target.value })} placeholder="https://..." /><button onClick={() => setMediaOpen(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex-shrink-0"><FolderOpen size={12} />图片素材库</button></div>{mod.image && <div className="mt-2 h-24 rounded-lg overflow-hidden bg-muted"><img src={mod.image} alt="商品图预览" className="w-full h-full object-cover" /></div>}</FormField>
      <FormField label="图片位置"><div className="flex gap-2">{positions.map((p) => <button key={p.value} onClick={() => onChange({ ...mod, imagePosition: p.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.imagePosition === p.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{p.label}</button>)}</div></FormField>
      <div className="grid grid-cols-2 gap-3"><FormField label="价格"><input className="input-field" value={mod.price} onChange={(e) => onChange({ ...mod, price: e.target.value })} placeholder="¥0" /></FormField><FormField label="原价"><input className="input-field" value={mod.originalPrice} onChange={(e) => onChange({ ...mod, originalPrice: e.target.value })} placeholder="¥0" /></FormField></div>
      <div className="grid grid-cols-2 gap-3"><FormField label="标签颜色"><div className="flex items-center gap-2"><input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.tagColor} onChange={(e) => onChange({ ...mod, tagColor: e.target.value })} /><input className="input-field flex-1" value={mod.tagColor} onChange={(e) => onChange({ ...mod, tagColor: e.target.value })} /></div></FormField><FormField label="背景颜色"><div className="flex items-center gap-2"><input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.bgColor} onChange={(e) => onChange({ ...mod, bgColor: e.target.value })} /><input className="input-field flex-1" value={mod.bgColor} onChange={(e) => onChange({ ...mod, bgColor: e.target.value })} /></div></FormField></div>
      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">显示购买按钮</span><Toggle value={mod.showBuyButton} onChange={(v) => onChange({ ...mod, showBuyButton: v })} /></div>
      {mod.showBuyButton && <><FormField label="按钮文字"><input className="input-field" value={mod.buyButtonText} onChange={(e) => onChange({ ...mod, buyButtonText: e.target.value })} /></FormField><FormField label="按钮链接"><input className="input-field" value={mod.buyButtonUrl} onChange={(e) => onChange({ ...mod, buyButtonUrl: e.target.value })} placeholder="https://..." /></FormField></>}
    </div>
  );
}

function ContactEditor({ mod, onChange }: { mod: ContactModule; onChange: (m: ContactModule) => void }) {
  return (
    <div className="space-y-4">
      <FormField label="电话">
        <input className="input-field" value={mod.phone} onChange={(e) => onChange({ ...mod, phone: e.target.value })} />
      </FormField>
      <FormField label="邮箱">
        <input className="input-field" value={mod.email} onChange={(e) => onChange({ ...mod, email: e.target.value })} />
      </FormField>
      <FormField label="微信号">
        <input className="input-field" value={mod.wechat} onChange={(e) => onChange({ ...mod, wechat: e.target.value })} />
      </FormField>
      <FormField label="地址">
        <textarea
          className="input-field resize-none"
          value={mod.address}
          onChange={(e) => onChange({ ...mod, address: e.target.value })}
          rows={2}
        />
      </FormField>
      <FormField label="网址">
        <input className="input-field" value={mod.website} onChange={(e) => onChange({ ...mod, website: e.target.value })} placeholder="www.example.com" />
      </FormField>
      <FormField label="营业时间">
        <input className="input-field" value={mod.businessHours} onChange={(e) => onChange({ ...mod, businessHours: e.target.value })} placeholder="周一至周日 09:00-18:00" />
      </FormField>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">显示联系按钮</span>
        <Toggle value={mod.showCallButton} onChange={(v) => onChange({ ...mod, showCallButton: v })} />
      </div>
      {mod.showCallButton && (
        <FormField label="按钮文字">
          <input className="input-field" value={mod.buttonText} onChange={(e) => onChange({ ...mod, buttonText: e.target.value })} />
        </FormField>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">显示地图</span>
        <Toggle value={mod.showMap} onChange={(v) => onChange({ ...mod, showMap: v })} />
      </div>
    </div>
  );
}

function TestimonialEditor({ mod, onChange }: { mod: TestimonialModule; onChange: (m: TestimonialModule) => void }) {
  return (
    <div className="space-y-4">
      <FormField label="标题">
        <input className="input-field" value={mod.title} onChange={(e) => onChange({ ...mod, title: e.target.value })} />
      </FormField>
      <FormField label="布局">
        <div className="flex gap-2">
          {([{ value: "list", label: "列表" }, { value: "grid", label: "网格" }] as const).map((opt) => (
            <button key={opt.value} onClick={() => onChange({ ...mod, layout: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.layout === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>
          ))}
        </div>
      </FormField>
      <FormField label="卡片风格">
        <div className="flex gap-2">
          {([{ value: "plain", label: "朴素" }, { value: "bordered", label: "描边" }, { value: "filled", label: "填充" }] as const).map((opt) => (
            <button key={opt.value} onClick={() => onChange({ ...mod, cardStyle: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.cardStyle === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>
          ))}
        </div>
      </FormField>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">显示星级评分</span>
        <Toggle value={mod.showRating} onChange={(v) => onChange({ ...mod, showRating: v })} />
      </div>
      <FormField label={`评价 (${mod.items.length}条)`}>
        <div className="space-y-3">
          {mod.items.map((item, i) => (
            <div key={i} className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <img src={item.avatar} alt={item.name} className="w-7 h-7 rounded-full object-cover" />
                <input
                  className="input-field flex-1 text-xs"
                  placeholder="姓名"
                  value={item.name}
                  onChange={(e) => {
                    const items = [...mod.items];
                    items[i] = { ...items[i], name: e.target.value };
                    onChange({ ...mod, items });
                  }}
                />
                <button
                  onClick={() => onChange({ ...mod, items: mod.items.filter((_, j) => j !== i) })}
                  className="p-1 hover:text-destructive transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <input
                className="input-field text-xs"
                placeholder="职位/身份"
                value={item.role}
                onChange={(e) => {
                  const items = [...mod.items];
                  items[i] = { ...items[i], role: e.target.value };
                  onChange({ ...mod, items });
                }}
              />
              <textarea
                className="input-field text-xs resize-none"
                placeholder="评价内容"
                value={item.content}
                rows={2}
                onChange={(e) => {
                  const items = [...mod.items];
                  items[i] = { ...items[i], content: e.target.value };
                  onChange({ ...mod, items });
                }}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">星级：</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      const items = [...mod.items];
                      items[i] = { ...items[i], rating: star };
                      onChange({ ...mod, items });
                    }}
                    className={`w-5 h-5 text-xs rounded border transition-all ${item.rating >= star ? "border-amber-400 bg-amber-400/20 text-amber-500" : "border-border text-muted-foreground"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-ghost w-full text-xs justify-center gap-1.5">
            <Plus size={12} />
            添加评价
          </button>
        </div>
      </FormField>
    </div>
  );
}

function CtaEditor({ mod, onChange }: { mod: CtaModule; onChange: (m: CtaModule) => void }) {
  return (
    <div className="space-y-4">
      <FormField label="标题">
        <input className="input-field" value={mod.title} onChange={(e) => onChange({ ...mod, title: e.target.value })} />
      </FormField>
      <FormField label="副标题">
        <input className="input-field" value={mod.subtitle} onChange={(e) => onChange({ ...mod, subtitle: e.target.value })} />
      </FormField>
      <FormField label="按钮文字">
        <input className="input-field" value={mod.buttonText} onChange={(e) => onChange({ ...mod, buttonText: e.target.value })} />
      </FormField>
      <FormField label="跳转链接">
        <input
          className="input-field"
          value={mod.buttonUrl}
          onChange={(e) => onChange({ ...mod, buttonUrl: e.target.value })}
          placeholder="https://..."
        />
      </FormField>
      <FormField label="背景颜色">
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="w-9 h-9 rounded-lg border border-border cursor-pointer"
            value={mod.bgColor}
            onChange={(e) => onChange({ ...mod, bgColor: e.target.value })}
          />
          <input
            className="input-field flex-1"
            value={mod.bgColor}
            onChange={(e) => onChange({ ...mod, bgColor: e.target.value })}
          />
        </div>
      </FormField>
      <FormField label="文字颜色">
        <div className="flex items-center gap-2">
          <input type="color" className="w-9 h-9 rounded-lg border border-border cursor-pointer" value={mod.textColor} onChange={(e) => onChange({ ...mod, textColor: e.target.value })} />
          <input className="input-field flex-1" value={mod.textColor} onChange={(e) => onChange({ ...mod, textColor: e.target.value })} />
        </div>
      </FormField>
      <FormField label="对齐方式">
        <div className="flex gap-2">
          {([{ value: "left", label: "左" }, { value: "center", label: "中" }, { value: "right", label: "右" }] as const).map((opt) => (
            <button key={opt.value} onClick={() => onChange({ ...mod, align: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.align === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>
          ))}
        </div>
      </FormField>
      <FormField label="按钮风格">
        <div className="flex gap-2">
          {([{ value: "filled", label: "填充" }, { value: "outline", label: "描边" }, { value: "ghost", label: "幽灵" }] as const).map((opt) => (
            <button key={opt.value} onClick={() => onChange({ ...mod, buttonStyle: opt.value })} className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${mod.buttonStyle === opt.value ? "border-primary bg-secondary text-primary font-medium" : "border-border hover:border-primary/40"}`}>{opt.label}</button>
          ))}
        </div>
      </FormField>
      <FormField label="背景图片">
        <div className="flex gap-2">
          <input className="input-field flex-1" value={mod.bgImage} onChange={(e) => onChange({ ...mod, bgImage: e.target.value })} placeholder="https://..." />
          <button className="btn-icon" title="上传图片"><Upload size={14} /></button>
        </div>
      </FormField>
    </div>
  );
}

// ─── Preview Components ───────────────────────────────────────────────────────

function PreviewBrandHeader({ mod }: { mod: BrandHeaderModule }) {
  const logoRadius = mod.logoShape === "circle" ? "rounded-full" : mod.logoShape === "square" ? "rounded-none" : "rounded-2xl";
  const isLeft = mod.layout === "left";
  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: mod.bgColor, color: mod.textColor, minHeight: 160 }}
    >
      {mod.bgImage && (
        <img src={mod.bgImage} alt="背景" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      {mod.showTagBadge && (
        <div className="absolute top-2 right-2 z-20 px-2 py-0.5 bg-amber-400 text-amber-900 text-[9px] font-bold rounded-full">官方认证</div>
      )}
      <div className={`relative z-10 ${isLeft ? "pl-6 pr-4" : "p-6"} flex flex-col ${isLeft ? "items-start text-left" : "items-center text-center"} gap-3`}>
        <div className={`w-16 h-16 ${logoRadius} overflow-hidden shadow-lg ring-2 ring-white/30`}>
          <img src={mod.logo} alt={mod.companyName} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide" style={{ color: mod.textColor }}>{mod.companyName}</h1>
          <p className="text-xs mt-1 opacity-80" style={{ color: mod.textColor }}>{mod.tagline}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewArticle({ mod }: { mod: ArticleModule }) {
  const paddingCls = mod.paddingSize === "compact" ? "p-3" : mod.paddingSize === "spacious" ? "p-7" : "p-5";
  const fontSizeCls = mod.fontSize === "small" ? "text-[10px]" : mod.fontSize === "large" ? "text-xs" : "text-[11px]";
  return (
    <div className={paddingCls} style={{ backgroundColor: mod.bgColor }}>
      <h2 className="text-sm font-semibold mb-2" style={{ color: mod.titleColor }}>{mod.title}</h2>
      {mod.showDivider && <div className="w-8 h-0.5 bg-primary mb-3 rounded-full" />}
      <p className={`${fontSizeCls} leading-relaxed ${mod.bold ? "font-semibold" : "font-normal"} ${mod.italic ? "italic" : ""}`} style={{ textAlign: mod.align, color: mod.contentColor }}>{mod.content}</p>
    </div>
  );
}

function PreviewGallery({ mod }: { mod: GalleryModule }) {
  const colsCls = mod.columns === 3 ? "grid-cols-3" : mod.columns === 4 ? "grid-cols-4" : "grid-cols-2";
  const gapCls = mod.gap === "tight" ? "gap-0.5" : mod.gap === "loose" ? "gap-3" : "gap-1.5";
  const aspectCls = mod.aspectRatio === "square" ? "aspect-square" : mod.aspectRatio === "16:9" ? "aspect-video" : "aspect-[4/3]";
  const heights = [92, 132, 108, 150, 118, 96];
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">{mod.title}</h2>
      {mod.layout === "carousel" ? (
        <div className="overflow-hidden">
          <div className="flex gap-2 overflow-x-auto snap-x pb-1" style={{ scrollbarWidth: "none" }}>
            {mod.images.map((img, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-muted min-w-[82%] aspect-[4/3] snap-center">
                <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                {mod.showCaption && img.caption && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2"><span className="text-[10px] text-white">{img.caption}</span></div>}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-1">{mod.images.slice(0, 5).map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-primary" : "bg-muted"}`} />)}</div>
        </div>
      ) : mod.layout === "masonry" ? (
        <div className={mod.gap === "tight" ? "space-y-1" : mod.gap === "loose" ? "space-y-3" : "space-y-2"} style={{ columnCount: mod.columns, columnGap: mod.gap === "tight" ? 4 : mod.gap === "loose" ? 12 : 8 }}>
          {mod.images.map((img, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg bg-muted mb-2 break-inside-avoid" style={{ height: heights[i % heights.length] }}>
              <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
              {mod.showCaption && img.caption && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5"><span className="text-[10px] text-white">{img.caption}</span></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${colsCls} ${gapCls}`}>{mod.images.map((img, i) => <div key={i} className={`relative overflow-hidden rounded-lg bg-muted ${aspectCls}`}><img src={img.url} alt={img.caption} className="w-full h-full object-cover" />{mod.showCaption && img.caption && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5"><span className="text-[10px] text-white">{img.caption}</span></div>}</div>)}</div>
      )}
    </div>
  );
}

function PreviewVideo({ mod }: { mod: VideoModule }) {
  const aspectCls = mod.aspectRatio === "4:3" ? "aspect-[4/3]" : mod.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video";
  return (
    <div className="p-4">
      {mod.showTitle && <h2 className="text-sm font-semibold text-foreground mb-3">{mod.title}</h2>}
      <div className={`relative rounded-xl overflow-hidden bg-muted ${aspectCls}`}>
        <img src={mod.thumbnail} alt={mod.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play size={18} className="text-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      {mod.description && (
        <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">{mod.description}</p>
      )}
    </div>
  );
}

function PreviewProductStory({ mod }: { mod: ProductStoryModule }) {
  const isTop = mod.imagePosition === "top";
  return (
    <div className="p-4" style={{ backgroundColor: mod.bgColor }}>
      <div className={`flex ${isTop ? "flex-col" : mod.imagePosition === "left" ? "flex-row" : "flex-row-reverse"} gap-3`}>
        <div className={`${isTop ? "w-full" : "w-2/5"} flex-shrink-0`}><div className={`overflow-hidden rounded-xl bg-muted ${isTop ? "aspect-video" : "aspect-[3/4]"}`}><img src={mod.image} alt={mod.title} className="w-full h-full object-cover" /></div></div>
        <div className="flex-1 py-1" style={{ textAlign: mod.align }}>
          {mod.tag && <span className="inline-block px-2 py-0.5 text-white text-[10px] font-medium rounded-full mb-2" style={{ backgroundColor: mod.tagColor }}>{mod.tag}</span>}
          <h2 className="text-sm font-bold text-foreground leading-tight">{mod.title}</h2>
          {mod.subtitle && <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">{mod.subtitle}</p>}
          <p className={`text-[11px] leading-relaxed text-muted-foreground ${mod.bold ? "font-semibold" : "font-normal"} ${mod.italic ? "italic" : ""}`}>{mod.content}</p>
          {(mod.price || mod.originalPrice) && <div className={`flex items-baseline gap-2 mt-2 ${mod.align === "center" ? "justify-center" : mod.align === "right" ? "justify-end" : "justify-start"}`}>{mod.price && <span className="text-sm font-bold text-emerald-600">{mod.price}</span>}{mod.originalPrice && <span className="text-[10px] text-muted-foreground line-through">{mod.originalPrice}</span>}</div>}
        </div>
      </div>
      {mod.showBuyButton && mod.buyButtonText && <button className="mt-3 w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">{mod.buyButtonText}</button>}
    </div>
  );
}

function PreviewTestimonial({ mod }: { mod: TestimonialModule }) {
  const cardCls = mod.cardStyle === "plain" ? "" : mod.cardStyle === "bordered" ? "border border-border" : "bg-muted";
  const gridCls = mod.layout === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3";
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">{mod.title}</h2>
      <div className={gridCls}>
        {mod.items.map((item, i) => (
          <div key={i} className={`p-3 rounded-xl ${cardCls}`}>
            <p className="text-[11px] leading-relaxed text-muted-foreground mb-3">"{item.content}"</p>
            <div className="flex items-center gap-2">
              <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-medium text-foreground">{item.name}</p>
                  {mod.showRating && (
                    <span className="text-[10px] text-amber-400">{"★".repeat(item.rating ?? 5)}</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewContact({ mod }: { mod: ContactModule }) {
  const items = [
    { icon: Phone, label: mod.phone },
    { icon: Share2, label: mod.email },
    { icon: FileText, label: mod.wechat ? `微信：${mod.wechat}` : "" },
    { icon: ExternalLink, label: mod.website },
    { icon: Settings, label: mod.businessHours },
  ].filter((x) => x.label);
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">联系我们</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon size={12} className="text-primary" />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
        {mod.address && (
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Link size={12} className="text-primary" />
            </div>
            <span className="flex-1 p-[0px]">{mod.address}</span>
          </div>
        )}
        {mod.showMap && (
          <div className="mt-2 h-20 rounded-xl overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=160&fit=crop&auto=format"
              alt="地图"
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        )}
        {mod.showCallButton && mod.buttonText && (
          <button className="mt-2 w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">
            {mod.buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

function PreviewCta({ mod }: { mod: CtaModule }) {
  const alignCls = mod.align === "left" ? "text-left" : mod.align === "right" ? "text-right" : "text-center";
  const itemsAlignCls = mod.align === "left" ? "items-start" : mod.align === "right" ? "items-end" : "items-center";
  const btnCls =
    mod.buttonStyle === "outline"
      ? "border border-white text-white bg-transparent"
      : mod.buttonStyle === "ghost"
      ? "text-white underline bg-transparent border-0"
      : "bg-white";
  return (
    <div className={`p-5 relative overflow-hidden flex flex-col ${itemsAlignCls} ${alignCls}`} style={{ backgroundColor: mod.bgColor }}>
      {mod.bgImage && (
        <img src={mod.bgImage} alt="背景" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="relative z-10 flex flex-col gap-2" style={{ alignItems: mod.align === "left" ? "flex-start" : mod.align === "right" ? "flex-end" : "center" }}>
        <h2 className="text-sm font-bold mb-1" style={{ color: mod.textColor }}>{mod.title}</h2>
        <p className="text-[11px] mb-3" style={{ color: mod.textColor, opacity: 0.7 }}>{mod.subtitle}</p>
        <button className={`px-5 py-2 text-xs font-semibold rounded-full ${btnCls}`} style={mod.buttonStyle === "filled" ? { color: mod.bgColor } : { color: mod.textColor }}>
          {mod.buttonText}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground/70">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${value ? "border-primary bg-primary shadow-inner" : "border-border bg-switch-background"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Module Card (Left Panel) ─────────────────────────────────────────────────

function ModuleCard({
  mod,
  isActive,
  onSelect,
  onDelete,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: {
  mod: Module;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const Icon = MODULE_ICONS[mod.type];
  const color = MODULE_COLORS[mod.type];
  const label = MODULE_LABELS[mod.type];
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onClick={onSelect}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
        isDragOver
          ? "border-primary border-dashed bg-secondary/50"
          : isActive
          ? "border-primary/30 bg-secondary shadow-sm"
          : "border-transparent hover:border-border hover:bg-card"
      }`}
    >
      <div className="opacity-0 group-hover:opacity-30 cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={13} className="text-muted-foreground" />
      </div>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon size={14} />
      </div>
      <p className="flex-1 text-xs font-medium text-foreground">{label}</p>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-destructive transition-all"
      >
        <Trash2 size={12} />
      </button>
      {isActive && <div className="w-1 h-4 rounded-full bg-primary flex-shrink-0" />}
    </div>
  );
}

// ─── Add Module Palette ───────────────────────────────────────────────────────

const ADD_TEMPLATES: { type: ModuleType; label: string; desc: string }[] = [
  { type: "article", label: "企业文化", desc: "品牌理念与文化介绍" },
  { type: "gallery", label: "图片画廊", desc: "多图展示网格" },
  { type: "video", label: "视频模块", desc: "嵌入视频播放" },
  { type: "product_story", label: "商品故事", desc: "图文混排商品介绍" },
  { type: "testimonial", label: "客户评价", desc: "用户反馈展示" },
  { type: "cta", label: "行动召唤", desc: "按钮引导转化" },
  { type: "contact", label: "联系方式", desc: "电话邮件地址" },
];

function createModule(type: ModuleType): Module {
  const id = `m${Date.now()}`;
  switch (type) {
    case "article":
      return { id, type, visible: true, title: "企业文化", content: "在这里输入企业文化内容...", align: "left", showDivider: true, titleColor: "#1A1B2E", contentColor: "#6B7280", bgColor: "#ffffff", fontSize: "medium", paddingSize: "normal", bold: false, italic: false };
    case "gallery":
      return {
        id, type, visible: true, title: "图片展示", layout: "grid",
        images: [
          { url: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=400&h=300&fit=crop&auto=format", caption: "图片1" },
        ],
        columns: 2, gap: "normal", showCaption: true, aspectRatio: "4:3",
      };
    case "video":
      return {
        id, type, visible: true, title: "视频标题",
        videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1601388352547-2802c6a8a127?w=800&h=450&fit=crop&auto=format",
        autoplay: false, showTitle: true, description: "", loop: false, muted: false, aspectRatio: "16:9",
      };
    case "product_story":
      return {
        id, type, visible: true, title: "商品名称", subtitle: "副标题",
        content: "商品故事内容...",
        image: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&h=500&fit=crop&auto=format",
        imagePosition: "right", tag: "新品", price: "", originalPrice: "", tagColor: "#10b981", showBuyButton: false, buyButtonText: "了解详情", buyButtonUrl: "#", bgColor: "#ffffff", align: "left", bold: false, italic: false,
      };
    case "testimonial":
      return {
        id, type, visible: true, title: "客户评价",
        items: [{ name: "张三", role: "用户", content: "非常好用！", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format", rating: 5 }],
        layout: "list", showRating: true, cardStyle: "bordered",
      };
    case "cta":
      return { id, type, visible: true, title: "立即体验", subtitle: "限时优惠，不容错过", buttonText: "马上行动", buttonUrl: "#", bgColor: "#4F46E5", buttonStyle: "filled", align: "center", bgImage: "", textColor: "#ffffff" };
    case "contact":
      return { id, type, visible: true, phone: "400-000-0000", email: "contact@company.com", address: "请输入地址", wechat: "", showMap: false, website: "", businessHours: "", showCallButton: false, buttonText: "立即咨询" };
    default:
      return { id, type: "article", visible: true, title: "企业文化", content: "", align: "left", showDivider: false, titleColor: "#1A1B2E", contentColor: "#6B7280", bgColor: "#ffffff", fontSize: "medium", paddingSize: "normal", bold: false, italic: false };
  }
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [modules, setModules] = useState<Module[]>(defaultModules);
  const [activeId, setActiveId] = useState<string>("m1");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"modules" | "settings">("modules");
  const [pageTitle, setPageTitle] = useState("云岭茶业扫码宣传页");
  const [pageThemeColor, setPageThemeColor] = useState("#1a3a2a");
  const [pageSlug, setPageSlug] = useState("yunling-tea-scan");
  const [shareDescription, setShareDescription] = useState("源自云南高山，扫码了解云岭茶业品牌故事与明星产品。");
  const [enableData, setEnableData] = useState(true);
  const [enableQrLogo, setEnableQrLogo] = useState(true);
  const [showFooterBrand, setShowFooterBrand] = useState(true);

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const previewModuleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeModule = modules.find((m) => m.id === activeId);

  const selectModule = (id: string) => {
    setActiveId(id);
    requestAnimationFrame(() => {
      const target = previewModuleRefs.current[id];
      const container = previewScrollRef.current;
      if (!target || !container) return;
      const targetTop = target.offsetTop - 42;
      container.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
    });
  };

  const updateModule = (updated: Module) => {
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const deleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    if (activeId === id) setActiveId(modules[0]?.id ?? "");
  };

  const toggleVisible = (id: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
  };

  const moveModule = (id: string, dir: -1 | 1) => {
    setModules((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const addModule = (type: ModuleType) => {
    const m = createModule(type);
    setModules((prev) => [...prev, m]);
    selectModule(m.id);
    setShowAddPanel(false);
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const renderEditor = (mod: Module) => {
    switch (mod.type) {
      case "brand_header": return <BrandHeaderEditor mod={mod} onChange={updateModule} />;
      case "article": return <ArticleEditor mod={mod} onChange={updateModule} />;
      case "gallery": return <GalleryEditor mod={mod} onChange={updateModule} />;
      case "video": return <VideoEditor mod={mod} onChange={updateModule} />;
      case "product_story": return <ProductStoryEditor mod={mod} onChange={updateModule} />;
      case "contact": return <ContactEditor mod={mod} onChange={updateModule} />;
      case "testimonial": return <TestimonialEditor mod={mod} onChange={updateModule} />;
      case "cta": return <CtaEditor mod={mod} onChange={updateModule} />;
    }
  };

  const renderPreview = (mod: Module) => {
    if (!mod.visible) return null;
    switch (mod.type) {
      case "brand_header": return <PreviewBrandHeader mod={mod} />;
      case "article": return <PreviewArticle mod={mod} />;
      case "gallery": return <PreviewGallery mod={mod} />;
      case "video": return <PreviewVideo mod={mod} />;
      case "product_story": return <PreviewProductStory mod={mod} />;
      case "contact": return <PreviewContact mod={mod} />;
      case "testimonial": return <PreviewTestimonial mod={mod} />;
      case "cta": return <PreviewCta mod={mod} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" style={{ fontFamily: "'Inter', 'Noto Sans SC', sans-serif" }}>

      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-5 h-14 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft size={16} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <QrCode size={14} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{pageTitle}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">扫码宣传页编辑器</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">已发布</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-accent rounded-lg transition-colors">
            <Eye size={13} />
            预览
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-accent rounded-lg transition-colors">
            <Share2 size={13} />
            分享链接
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Save size={13} />
            保存发布
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Module List ── */}
        <aside className="w-64 flex flex-col bg-card border-r border-border flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-border px-3 pt-3 gap-1">
            {[{ id: "modules", label: "模块" }, { id: "settings", label: "页面设置" }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "modules" | "settings")}
                className={`flex-1 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "modules" ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {modules.map((mod, i) => (
                  <ModuleCard
                    key={mod.id}
                    mod={mod}
                    isActive={mod.id === activeId}
                    onSelect={() => selectModule(mod.id)}
                    onDelete={() => deleteModule(mod.id)}
                    isDragOver={dragOverIndex === i}
                    onDragStart={() => { dragIndexRef.current = i; }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                    onDragEnd={() => { dragIndexRef.current = null; setDragOverIndex(null); }}
                    onDrop={() => {
                      const from = dragIndexRef.current;
                      if (from === null || from === i) return;
                      setModules((prev) => {
                        const arr = [...prev];
                        const [item] = arr.splice(from, 1);
                        arr.splice(i, 0, item);
                        return arr;
                      });
                      dragIndexRef.current = null;
                      setDragOverIndex(null);
                    }}
                  />
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => setShowAddPanel(!showAddPanel)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-primary bg-secondary hover:bg-secondary/70 rounded-lg transition-colors"
                >
                  <Plus size={13} />
                  添加模块
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <FormField label="页面标题">
                <input
                  className="input-field"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                />
              </FormField>
              <FormField label="品牌主色">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-9 h-9 rounded-lg border border-border cursor-pointer"
                    value={pageThemeColor}
                    onChange={(e) => setPageThemeColor(e.target.value)}
                  />
                  <input
                    className="input-field flex-1"
                    value={pageThemeColor}
                    onChange={(e) => setPageThemeColor(e.target.value)}
                  />
                </div>
              </FormField>
              <FormField label="页面短链 Slug">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border">
                  <span className="text-[10px] text-muted-foreground">/scan/</span>
                  <input className="flex-1 bg-transparent text-xs outline-none text-foreground" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} />
                </div>
              </FormField>
              <FormField label="分享描述">
                <textarea className="input-field resize-none min-h-[72px]" value={shareDescription} onChange={(e) => setShareDescription(e.target.value)} />
              </FormField>
              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-3">
                <p className="text-xs font-medium text-foreground/70">扫码与数据</p>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">二维码中心嵌入品牌 Logo</span><Toggle value={enableQrLogo} onChange={setEnableQrLogo} /></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">开启访问量与转化统计</span><Toggle value={enableData} onChange={setEnableData} /></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">显示页脚品牌署名</span><Toggle value={showFooterBrand} onChange={setShowFooterBrand} /></div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs font-medium text-foreground/70 mb-2">发布检查</p>
                <div className="space-y-1.5 text-[11px] text-muted-foreground">
                  <p>• 已配置 {modules.filter((m) => m.visible).length} 个可见模块</p>
                  <p>• 预览地址：yunling-tea.com/scan/{pageSlug}</p>
                  <p>• 可用于批量生成包装、海报和桌牌二维码</p>
                </div>
              </div>
              
            </div>
          )}
        </aside>

        {/* ── Center: Editor Panel ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {showAddPanel ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">选择模块类型</h3>
                <button onClick={() => setShowAddPanel(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ADD_TEMPLATES.map((t) => {
                  const Icon = MODULE_ICONS[t.type];
                  const color = MODULE_COLORS[t.type];
                  return (
                    <button
                      key={t.type}
                      onClick={() => addModule(t.type)}
                      className="flex items-start gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : activeModule ? (
            <div className="flex-1 overflow-y-auto">
              {/* Editor Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-card border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${MODULE_COLORS[activeModule.type]}15`, color: MODULE_COLORS[activeModule.type] }}
                  >
                    {(() => { const Icon = MODULE_ICONS[activeModule.type]; return <Icon size={15} />; })()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{MODULE_LABELS[activeModule.type]}</p>
                    <p className="text-[10px] text-muted-foreground">编辑模块内容与样式</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-1 bg-muted text-muted-foreground rounded-full font-mono">{activeModule.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">可见</span>
                    <Toggle
                      value={activeModule.visible}
                      onChange={() => toggleVisible(activeModule.id)}
                    />
                  </div>
                </div>
              </div>
              {/* Editor Body */}
              <div className="p-5">{renderEditor(activeModule)}</div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              选择左侧模块开始编辑
            </div>
          )}
        </main>

        {/* ── Right: Phone Preview ── */}
        <aside className="w-[420px] flex flex-col items-center bg-background border-l border-border flex-shrink-0 overflow-hidden">
          <div className="w-full flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <span className="text-xs font-semibold text-foreground">实时预览</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">扫码后页面效果</span>
              <button className="p-1 rounded hover:bg-muted transition-colors" title="复制链接">
                <Copy size={11} className="text-muted-foreground" />
              </button>
              <button className="p-1 rounded hover:bg-muted transition-colors" title="在新窗口打开">
                <ExternalLink size={11} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Phone Frame */}
          <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
            <div className="relative flex-shrink-0">
              {/* Phone Shell */}
              <div className="relative w-[300px] rounded-[36px] bg-foreground shadow-2xl ring-4 ring-foreground/10 overflow-hidden">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-foreground">
                  <span className="text-[9px] text-white/60 font-medium">9:41</span>
                  <div className="w-16 h-4 bg-foreground rounded-full absolute left-1/2 -translate-x-1/2 top-0" />
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[3, 4, 5, 4].map((h, i) => (
                        <div key={i} className={`w-0.5 rounded-sm bg-white/60`} style={{ height: h }} />
                      ))}
                    </div>
                    <div className="w-5 h-2.5 rounded-sm border border-white/60 relative overflow-hidden">
                      <div className="absolute inset-y-0.5 left-0.5 w-3/4 bg-white/60 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Screen Content */}
                <div
                  className="overflow-y-auto bg-white"
                  ref={previewScrollRef}
                  style={{ height: 600, scrollbarWidth: "none" }}
                >
                  {/* Mini browser bar */}
                  

                  {/* Page Modules */}
                  <div className="divide-y divide-gray-100">
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        ref={(el) => { previewModuleRefs.current[mod.id] = el; }}
                        onClick={() => selectModule(mod.id)}
                        className={`cursor-pointer transition-all ${
                          activeId === mod.id ? "ring-2 ring-primary ring-inset" : ""
                        } ${!mod.visible ? "opacity-30" : ""}`}
                      >
                        {renderPreview(mod)}
                      </div>
                    ))}
                  </div>

                  {/* Page Footer */}
                  {showFooterBrand && (
                    <div className="py-4 text-center bg-gray-50">
                      <p className="text-[9px] text-gray-400">Powered by 码故 · {pageSlug}</p>
                    </div>
                  )}
                </div>

                {/* Home Indicator */}
                <div className="flex justify-center pb-2 pt-1 bg-white">
                  <div className="w-16 h-1 rounded-full bg-gray-300" />
                </div>
              </div>

              {/* QR Code below phone */}
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-card rounded-xl border border-border shadow-sm">
                  <div className="relative w-20 h-20 bg-foreground rounded-lg flex items-center justify-center overflow-hidden">
                    <QrCode size={58} className="text-primary-foreground opacity-70" />
                    {enableQrLogo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={(modules.find((m) => m.type === "brand_header") as BrandHeaderModule | undefined)?.logo} alt="QR Logo" className="w-7 h-7 rounded-md object-cover ring-2 ring-card" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">扫码访问宣传页</p>
                <button className="text-[10px] text-primary font-medium flex items-center gap-1 hover:underline">
                  <Copy size={9} />
                  下载二维码
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Save Toast ── */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 bg-foreground text-primary-foreground text-xs font-medium rounded-xl shadow-xl z-50">
          <Check size={13} className="text-emerald-400" />
          页面已保存并发布
        </div>
      )}

      <style>{`
        .input-field {
          width: 100%;
          padding: 6px 10px;
          font-size: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--input-background);
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s;
          font-family: 'Inter', 'Noto Sans SC', sans-serif;
        }
        .input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 12%, transparent);
        }
        .btn-ghost {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 500;
          color: var(--muted-foreground);
          background: transparent;
          border: 1px dashed var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-ghost:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: var(--secondary);
        }
        .btn-icon {
          padding: 6px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--input-background);
          cursor: pointer;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .btn-icon:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
      `}</style>
    </div>
  );
}
