import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export default function CustomDialog({isOpen, title, children,  onClose, }) {

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-full max-w-[500px] rounded-lg border bg-[#1a1a1a] p-6">
            <DialogTitle className="text-xl font-bold text-white mb-4">{title}</DialogTitle>
            {/* <Description>This will permanently deactivate your account</Description> */}
            {children}
           
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
