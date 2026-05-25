export async function fetchProfile(username: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function fetchUserPosts(username: string, page = 1) {
  const res = await fetch(`/api/users/${encodeURIComponent(username)}/posts?page=${page}`);
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json();
}

export async function fetchUserComments(username: string, page = 1) {
  const res = await fetch(`/api/users/${encodeURIComponent(username)}/comments?page=${page}`);
  if (!res.ok) throw new Error('Failed to load comments');
  return res.json();
}
