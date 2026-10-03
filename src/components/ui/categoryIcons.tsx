import React from 'react';
import {
  Building2,
  Receipt,
  Zap,
  Building,
  GraduationCap,
  Landmark,
  Moon,
  Briefcase,
  Car,
  DollarSign,
  TrendingUp,
  Calendar,
  Compass,
  Calculator,
} from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-full w-full" />,
  Receipt: <Receipt className="h-full w-full" />,
  Zap: <Zap className="h-full w-full" />,
  Building: <Building className="h-full w-full" />,
  GraduationCap: <GraduationCap className="h-full w-full" />,
  Landmark: <Landmark className="h-full w-full" />,
  Moon: <Moon className="h-full w-full" />,
  Briefcase: <Briefcase className="h-full w-full" />,
  Car: <Car className="h-full w-full" />,
  DollarSign: <DollarSign className="h-full w-full" />,
  TrendingUp: <TrendingUp className="h-full w-full" />,
  Calendar: <Calendar className="h-full w-full" />,
  Compass: <Compass className="h-full w-full" />,
};

/**
 * Shared category icon renderer. Pass the `icon` name from a
 * CategoryDefinition and a Tailwind size class (e.g. "h-4 w-4").
 * Falls back to a generic Calculator icon for unknown names.
 */
export function CategoryIcon({
  icon,
  className = 'h-4 w-4',
}: {
  icon: string;
  className?: string;
}) {
  return <span className={`inline-flex ${className}`}>{ICONS[icon] || <Calculator className="h-full w-full" />}</span>;
}
