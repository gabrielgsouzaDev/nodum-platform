"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-[#111114] group-[.toaster]:text-white group-[.toaster]:border-white/5 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-6",
                    description: "group-[.toast]:text-slate-500 font-bold text-xs",
                    actionButton:
                        "group-[.toast]:bg-[#B23611] group-[.toast]:text-white",
                    cancelButton:
                        "group-[.toast]:bg-white/5 group-[.toast]:text-slate-500",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
