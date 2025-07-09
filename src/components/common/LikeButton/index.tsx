import React from 'react'
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { useLike } from '@/hooks/useLike'

interface LikeButtonProps {
  articleId: string
  className?: string
  showCount?: boolean
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  articleId, 
  className = '',
  showCount = true 
}) => {
  const { likeCount, isLiked, isLoading, toggleLike } = useLike(articleId)

  return (
    <button
      onClick={toggleLike}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
        ${isLiked 
          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
          : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      title={isLiked ? 'いいねを取り消す' : 'いいねする'}
    >
      {isLiked ? (
        <AiFillHeart className="w-5 h-5" />
      ) : (
        <AiOutlineHeart className="w-5 h-5" />
      )}
      {showCount && (
        <span className="text-sm font-medium">
          {isLoading ? '...' : likeCount}
        </span>
      )}
    </button>
  )
}
