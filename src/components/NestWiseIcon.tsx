'use client'

import {
  AlertTriangle,
  ArrowRight,
  AtSign,
  Banknote,
  BarChart3,
  Binoculars,
  Bitcoin,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Coins,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  Key,
  Landmark,
  Laptop,
  Layers,
  LayoutGrid,
  Link,
  ListChecks,
  Leaf,
  Lock,
  Mail,
  MessageCircle,
  Moon,
  Network,
  PartyPopper,
  Percent,
  PieChart,
  PiggyBank,
  Play,
  Plus,
  Receipt,
  Rocket,
  Scale,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Trophy,
  User,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  'alert-triangle': AlertTriangle,
  'arrow-right': ArrowRight,
  'at-sign': AtSign,
  banknote: Banknote,
  'bar-chart-3': BarChart3,
  binoculars: Binoculars,
  bitcoin: Bitcoin,
  'book-open': BookOpen,
  bot: Bot,
  briefcase: Briefcase,
  'building-2': Building2,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'circle-dollar-sign': CircleDollarSign,
  coins: Coins,
  'credit-card': CreditCard,
  'external-link': ExternalLink,
  eye: Eye,
  'file-text': FileText,
  flame: Flame,
  globe: Globe,
  'graduation-cap': GraduationCap,
  key: Key,
  landmark: Landmark,
  laptop: Laptop,
  layers: Layers,
  'layout-grid': LayoutGrid,
  link: Link,
  'list-checks': ListChecks,
  leaf: Leaf,
  lock: Lock,
  mail: Mail,
  'message-circle': MessageCircle,
  moon: Moon,
  network: Network,
  'party-popper': PartyPopper,
  percent: Percent,
  'pie-chart': PieChart,
  'piggy-bank': PiggyBank,
  play: Play,
  plus: Plus,
  receipt: Receipt,
  rocket: Rocket,
  scale: Scale,
  search: Search,
  settings: Settings,
  shield: Shield,
  'sliders-horizontal': SlidersHorizontal,
  sparkles: Sparkles,
  sun: Sun,
  target: Target,
  'trending-up': TrendingUp,
  trophy: Trophy,
  user: User,
  wallet: Wallet,
  x: X,
  zap: Zap,
}

export type NestWiseIconName = keyof typeof ICON_MAP

export function NestWiseIcon({
  name,
  className = '',
  size = 24,
  strokeWidth = 1.65,
}: {
  name: string
  className?: string
  size?: number
  strokeWidth?: number
}) {
  const Icon = ICON_MAP[name] ?? Search
  return <Icon className={className} size={size} strokeWidth={strokeWidth} aria-hidden />
}

/** Rounded container for feature / hero icons */
export function IconOrb({
  name,
  size = 22,
  className = '',
  large,
}: {
  name: string
  size?: number
  className?: string
  /** Bigger tile for hero / empty states */
  large?: boolean
}) {
  const box = large ? 'h-16 w-16 sm:h-[4.25rem] sm:w-[4.25rem]' : 'h-12 w-12 sm:h-14 sm:w-14'
  return (
    <div
      className={`inline-flex ${box} items-center justify-center rounded-2xl bg-dark-accent-green/10 text-dark-accent-green ring-1 ring-dark-accent-green/25 shadow-inner shadow-black/20 ${className}`}
    >
      <NestWiseIcon name={name} size={size} className="text-dark-accent-green" />
    </div>
  )
}
