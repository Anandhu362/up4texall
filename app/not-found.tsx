import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
            <p className="text-gray-600 mb-8">Could not find requested resource</p>
            <Link href="/" className="btn-primary">
                Return Home
            </Link>
        </div>
    );
}
