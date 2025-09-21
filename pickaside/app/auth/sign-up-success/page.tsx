// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
//
// export default function Page() {
//   return (
//     <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
//       <div className="w-full max-w-sm">
//         <div className="flex flex-col gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl">
//                 Thank you for signing up!
//               </CardTitle>
//               <CardDescription>Check your email to confirm</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-muted-foreground">
//                 You&apos;ve successfully signed up. Please check your email to
//                 confirm your account before signing in.
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
export default function SignUpSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email!</h1>
        <p className="text-gray-600 mb-6">
          We've sent you a confirmation email. Click the link in the email to verify your account and complete your registration.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or try signing up again.
        </p>
      </div>
    </div>
  )
}
