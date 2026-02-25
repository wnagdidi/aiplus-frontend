export default function CrownIcon(props: any) {
    const width = props.width || 12
    const height = props.height || 12
    const fill = props.fill || 'white'
    return (
        <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.87357 2.07337L5.99936 6.73288L2.06864 7.62618L2.87357 2.07337Z" fill={fill} />
            <path d="M10.8204 2.07312L7.69464 6.73263L11.6254 7.62593L10.8204 2.07312Z" fill={fill} />
            <path d="M10.4902 4.67236L13.3994 2.34521L12.5068 13.3999H1.49219L0.599609 2.34521L3.50879 4.67236L7 0.600098L10.4902 4.67236ZM5.25391 8.06396L6.89941 9.70947L8.54492 8.06396L6.89941 6.41846L5.25391 8.06396Z" fill={fill} />
        </svg>
    )
}