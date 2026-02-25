export default function RichSuccessIcon(props: any = {}) {
  const { fontSize = '72px', ...rest } = props
  return (
    <svg width="83" height="82" viewBox="0 0 83 82" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ fontSize }} {...rest}>
      <g clipPath="url(#clip0_637_2455)">
        <circle cx="41.5" cy="41" r="24" fill="white" />
        <circle cx="41.5" cy="41" r="32.5" stroke="#41F485" strokeOpacity="0.24" strokeWidth="17" />
        <path
          d="M41.5 17C28.276 17 17.5 27.776 17.5 41C17.5 54.224 28.276 65 41.5 65C54.724 65 65.5 54.224 65.5 41C65.5 27.776 54.724 17 41.5 17ZM52.972 35.48L39.364 49.088C39.028 49.424 38.572 49.616 38.092 49.616C37.612 49.616 37.156 49.424 36.82 49.088L30.028 42.296C29.332 41.6 29.332 40.448 30.028 39.752C30.724 39.056 31.876 39.056 32.572 39.752L38.092 45.272L50.428 32.936C51.124 32.24 52.276 32.24 52.972 32.936C53.668 33.632 53.668 34.76 52.972 35.48Z"
          fill="#41F485"
        />
      </g>
      <defs>
        <clipPath id="clip0_637_2455">
          <rect width="82" height="82" fill="white" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}
