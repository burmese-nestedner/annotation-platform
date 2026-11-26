import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SearchInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-[13px] -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
      <Input ref={ref} type="search" className="h-[34px] pl-8" {...props} />
    </div>
  ),
);
SearchInput.displayName = "SearchInput";

export default SearchInput;
