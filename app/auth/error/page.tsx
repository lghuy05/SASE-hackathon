// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//
// export default async function Page({
//   searchParams,
// }: {
//   searchParams: Promise<{ error: string }>;
// }) {
//   const params = await searchParams;
//
//   return (
//     <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
//       <div className="w-full max-w-sm">
//         <div className="flex flex-col gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl">
//                 Sorry, something went wrong.
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {params?.error ? (
//                 <p className="text-sm text-muted-foreground">
//                   Code error: {params.error}
//                 </p>
//               ) : (
//                 <p className="text-sm text-muted-foreground">
//                   An unspecified error occurred.
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );

export default function AuthError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was an error during authentication. Please try again.
        </p>
        <a
          href="/auth/login"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Login
        </a>
      </div>
    </div>
  )
} 
