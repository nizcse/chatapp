import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex space-x-2">
        <button>
          <ArrowPathIcon className="w-6 h-6 text-gray-500" />
        </button>
        <button>
          <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">5 of 6 phones</span>
        <div className="flex -space-x-2">
          <img
            src="https://picsum.photos/536/354"
            alt="User 1"
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <img
            src="https://picsum.photos/536/354"
            alt="User 2"
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <img
            src="https://picsum.photos/536/354"
            alt="User 3"
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            +3
          </div>
        </div>
      </div>
    </header>
  );
}