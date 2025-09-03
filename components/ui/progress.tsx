import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value = 0, ...props }, ref) => {
	return (
		<div ref={ref} role="progressbar" aria-valuenow={value} className={cn("w-full bg-muted h-2 rounded", className)} {...props}>
			<div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} className="h-full bg-primary rounded" />
		</div>
	);
});
Progress.displayName = "Progress";

export { Progress };
