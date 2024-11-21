
export function PageNav({ leftAction, rightAction }: {
    leftAction: React.ReactNode,
    rightAction: React.ReactNode,
}) {
    return <nav className="flex justify-between items-center p-3 bg-primary text-white">
        {leftAction}
        {rightAction}
    </nav>
}