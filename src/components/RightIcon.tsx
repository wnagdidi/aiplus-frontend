export default function RightIcon(props: any = {}) {
  const { useCurrentColor, className, style, ...rest } = props as any
  return (
    <svg 
      width="7" 
      height="10" 
      viewBox="0 0 7 10" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...rest}
    >
      <path d="M1 8.87793L4.88909 4.98884C4.88909 4.98884 2.1736 2.27336 0.999999 1.09976" stroke={useCurrentColor ? 'currentColor' : 'url(#paint0_radial_2579_745)'} stopColor="2"/>
      {!useCurrentColor && (
        <defs>
          <radialGradient id="paint0_radial_2579_745" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1.48684 7.77378) rotate(-100.457) scale(5.51129 32.4362)">
            <stop stopColor="#914BEC"/>
            <stop offset="1" stopColor="#507AF6"/>
          </radialGradient>
        </defs>
      )}
    </svg>
  )
}
