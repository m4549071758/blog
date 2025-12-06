import { redirect } from 'next/navigation';

export default function PostsIndex() {
  redirect('/posts/page/1');
}
