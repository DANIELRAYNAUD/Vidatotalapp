import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AlertDialog = Dialog
const AlertDialogTrigger = DialogTrigger
const AlertDialogContent = DialogContent
const AlertDialogHeader = DialogHeader
const AlertDialogTitle = DialogTitle
const AlertDialogDescription = DialogDescription
const AlertDialogFooter = DialogFooter

const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
    <Button ref={ref} className={cn(className)} {...props} />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
    <Button
        ref={ref}
        variant="outline"
        className={cn("mt-2 sm:mt-0", className)}
        {...props}
    />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
}
