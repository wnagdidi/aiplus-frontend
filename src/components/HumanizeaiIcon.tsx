export default function HumanizeaiIcon(props: any = {}) {
  const { useCurrentColor, className, style, ...rest } = props as any
  return (
    <svg 
      width="18" 
      height="16" 
      viewBox="0 0 18 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...rest}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M7.90906 0H10.0909V13.9091H7.90906V0ZM3.81825 3.81805H6.00007V14.9999H3.81825V3.81805ZM2.18182 7.36364H0V14.1818H2.18182V7.36364ZM11.7273 4.09091H13.9091V15.2727H11.7273V4.09091ZM18 7.36364H15.8182V14.1818H18V7.36364Z" fill={useCurrentColor ? 'currentColor' : 'url(#paint0_radial_2579_748)'} />
      {!useCurrentColor && (
        <defs>
          <radialGradient id="paint0_radial_2579_748" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(18 9.81818) rotate(-180) scale(18.5455 101.775)">
            <stop stopColor="#914BEC"/>
            <stop offset="1" stopColor="#507AF6"/>
          </radialGradient>
        </defs>
      )}
    </svg>
  )
}
