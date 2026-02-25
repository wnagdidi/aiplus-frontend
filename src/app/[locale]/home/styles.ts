import {CSSProperties} from 'react'
import {secondaryTextColor} from '@/theme'

export const mainContainerFooterStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}

export const mainContainerStyle = { pt: 24, flex: 1, pb: 4 }

export const mainTitleStyle = {
  mt: { sm: 7, xs: 4 },
  fontWeight: 700,
  fontSize: { sm: '36px', xs: '1.5rem' },
  lineHeight: { sm: '62px', xs: '2.25rem' },
  textAlign: 'center',
}

export const mainSubTitleStyle = {
  mt: 2,
  textAlign: 'center',
  color: secondaryTextColor,
  fontSize: { sm: '24px', xs: '16px' },
  lineHeight: { sm: '34px', xs: '24px' },
}
export const secondaryTitleStyle = {
  fontSize: { sm: '2.125rem', xs: '1.5rem' },
  lineHeight: { sm: 1.5, xs: '2.25rem' },
}

export const secondarySubTitleStyle = {
  fontSize: { sm: '20px', xs: '16px' },
  lineHeight: { sm: 1.5, xs: '24px' },
}

export const boxBorder = '1px solid rgba(0, 0, 0, 0.16)'

export const helperContainerStyle: CSSProperties = {
  position: 'relative',
  height: { sm: 488, xs: 450 },
}
export const helperContentStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '32px',
}
