import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function BackButton() {
  return (
    <Link href="/" className="inline-block py-2 px-4 rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
      <div className="flex items-center space-x-2">
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        <span>Back to gallery</span>
      </div>
    </Link>
  );
}