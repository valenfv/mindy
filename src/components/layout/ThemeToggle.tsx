import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const label = resolved === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="text-muted-foreground hover:text-foreground"
    >
      {resolved === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
