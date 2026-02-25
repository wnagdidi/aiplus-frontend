'use client'
import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {useTranslations} from '@/hooks/useTranslations'

export default function ModeSelect() {
  const t = useTranslations('Humanize')
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
      <Typography variant="body2">{t('mode')}:</Typography>
      <Typography
        id="mode-button"
        sx={{ ml: 1 }}
        variant="body2"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {t('mode_free')}
      </Typography>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'mode-button',
        }}
      >
        <MenuItem onClick={handleClose}>{t('mode_free')}</MenuItem>
        <MenuItem onClick={handleClose}>[] {t('mode_premium')}</MenuItem>
      </Menu>
    </Box>
  )
}
