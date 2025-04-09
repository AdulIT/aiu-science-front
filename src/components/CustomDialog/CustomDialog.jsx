import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export default function CustomDialog({isOpen, title, children,  onClose, }) {

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <DialogTitle className="font-bold">{title}</DialogTitle>
            {/* <Description>This will permanently deactivate your account</Description> */}
            {children}
           
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
