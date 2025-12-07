'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/features/admin/AdminLayout';
import { getAuthToken, getUserId } from '@/lib/authHandler';
import { RiInformationLine, RiSave3Line } from 'react-icons/ri';
import * as Tabs from '@radix-ui/react-tabs';

interface UserProfile {
  username: string;
  email: string;
  bio: string;
  github_url: string;
  twitter_url: string;
  qiita_url: string;
  misskey_url: string;
}

interface SiteConfig {
  site_title: string;
  site_description: string;
  google_analytics_id: string;
  ogp_image_url: string;
  twitter_card_type: string;
  twitter_site: string;
  robot_index: boolean;
  publisher_type: string;
  publisher_logo_url: string;
  publisher_description: string;
  social_links: string; // JSON string
}

const Tip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-2 align-middle">
    <RiInformationLine className="text-gray-400 hover:text-blue-500 cursor-help" />
    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    username: '', email: '', bio: '', github_url: '', twitter_url: '', qiita_url: '', misskey_url: ''
  });
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    site_title: '', site_description: '', google_analytics_id: '', ogp_image_url: '',
    twitter_card_type: 'summary_large_image', twitter_site: '', robot_index: true,
    publisher_type: 'Person', publisher_logo_url: '', publisher_description: '', social_links: '[]'
  });

  const [socialLinksArray, setSocialLinksArray] = useState<string[]>([]);
  
  const [password, setPassword] = useState({ current: '', new: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const userId = getUserId();
        if (!userId) throw new Error('User ID not found');

        // Fetch Profile
        const userRes = await fetch(`https://www.katori.dev/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
            const userData = await userRes.json();
            // nullチェックを行い、空文字をセットする
            setProfile({
                username: userData.username || '',
                email: userData.email || '',
                bio: userData.bio || '',
                github_url: userData.github_url || '',
                twitter_url: userData.twitter_url || '',
                qiita_url: userData.qiita_url || '',
                misskey_url: userData.misskey_url || '',
            });
        }

        // Fetch Site Config
        const configRes = await fetch(`https://www.katori.dev/api/site-config`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (configRes.ok) {
            const configData = await configRes.json();
             setSiteConfig({
                site_title: configData.site_title || '',
                site_description: configData.site_description || '',
                google_analytics_id: configData.google_analytics_id || '',
                ogp_image_url: configData.ogp_image_url || '',
                twitter_card_type: configData.twitter_card_type || 'summary_large_image',
                twitter_site: configData.twitter_site || '',
                robot_index: configData.robot_index ?? true,
                publisher_type: configData.publisher_type || 'Person',
                publisher_logo_url: configData.publisher_logo_url || '',
                publisher_description: configData.publisher_description || '',
                social_links: configData.social_links || '[]',
            });
            try {
                setSocialLinksArray(JSON.parse(configData.social_links || '[]'));
            } catch {
                setSocialLinksArray([]);
            }
        }
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'データの取得に失敗しました' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
        const token = getAuthToken();
        const userId = getUserId();
        const res = await fetch(`https://www.katori.dev/api/users/${userId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(profile)
        });
        if (!res.ok) throw new Error('更新に失敗しました');
        setMessage({ type: 'success', text: 'プロフィールを更新しました' });
    } catch (err) {
        setMessage({ type: 'error', text: '更新エラーが発生しました' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleConfigUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
        const token = getAuthToken();
        const body = {
            ...siteConfig,
            social_links: JSON.stringify(socialLinksArray)
        };
        const res = await fetch(`https://www.katori.dev/api/site-config`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('更新に失敗しました');
        setMessage({ type: 'success', text: 'サイト設定を更新し、ビルドを開始しました' });
    } catch (err) {
        setMessage({ type: 'error', text: '更新エラーが発生しました' });
    } finally {
        setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
        const token = getAuthToken();
        const res = await fetch(`https://www.katori.dev/api/change-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ current_password: password.current, new_password: password.new })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || '変更に失敗しました');
        }
        setMessage({ type: 'success', text: 'パスワードを変更しました' });
        setPassword({ current: '', new: '' });
    } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : '変更エラー' });
    } finally {
        setIsSaving(false);
    }
  };

  const addSocialLink = () => setSocialLinksArray([...socialLinksArray, '']);
  const updateSocialLink = (index: number, val: string) => {
      const newLinks = [...socialLinksArray];
      newLinks[index] = val;
      setSocialLinksArray(newLinks);
  };
  const removeSocialLink = (index: number) => {
      setSocialLinksArray(socialLinksArray.filter((_, i) => i !== index));
  };


  if (isLoading) return <AdminLayout><div className="text-center py-10">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">設定</h1>
        
        {message && (
            <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
            </div>
        )}

        <Tabs.Root defaultValue="profile" className="flex flex-col">
            <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-6" aria-label="Settings tabs">
                <Tabs.Trigger value="profile" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500">
                    プロフィール
                </Tabs.Trigger>
                <Tabs.Trigger value="account" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500">
                    アカウント
                </Tabs.Trigger>
                <Tabs.Trigger value="site" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500">
                    SEO・サイト設定
                </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="profile" className="outline-none">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ユーザー名</label>
                        <input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">自己紹介 (Bio)</label>
                        <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={3} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                            <input type="url" value={profile.github_url} onChange={e => setProfile({...profile, github_url: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">X (Twitter) URL</label>
                            <input type="url" value={profile.twitter_url} onChange={e => setProfile({...profile, twitter_url: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qiita URL</label>
                            <input type="url" value={profile.qiita_url} onChange={e => setProfile({...profile, qiita_url: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Misskey (misskey.systems) URL</label>
                            <input type="url" value={profile.misskey_url} onChange={e => setProfile({...profile, misskey_url: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="flex items-center justify-center w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                        <RiSave3Line className="mr-2" /> 更新する
                    </button>
                </form>
            </Tabs.Content>

             <Tabs.Content value="account" className="outline-none">
                <div className="space-y-8">
                     <form onSubmit={handleProfileUpdate} className="space-y-4 border-b pb-8 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">メールアドレス変更</h3>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                            <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                         <button type="submit" disabled={isSaving} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50">
                            メールアドレスを更新
                        </button>
                    </form>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">パスワード変更</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">現在のパスワード</label>
                            <input type="password" value={password.current} onChange={e => setPassword({...password, current: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">新しいパスワード</label>
                            <input type="password" value={password.new} onChange={e => setPassword({...password, new: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
                            パスワードを変更
                        </button>
                    </form>
                </div>
            </Tabs.Content>

            <Tabs.Content value="site" className="outline-none">
                <form onSubmit={handleConfigUpdate} className="space-y-8">
                    {/* 基本設定 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700">基本設定</h3>
                        <div>
                            <label className="block text-sm font-medium">サイト名 (Title) <Tip text="ブラウザのタブや検索結果のタイトルに表示されます。" /></label>
                            <input type="text" value={siteConfig.site_title} onChange={e => setSiteConfig({...siteConfig, site_title: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">サイト説明 (Description) <Tip text="検索結果の下部に表示される短い説明文です。120文字程度が推奨です。" /></label>
                            <textarea value={siteConfig.site_description} onChange={e => setSiteConfig({...siteConfig, site_description: e.target.value})} rows={2} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                    </div>

                    {/* 高度なSEO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700">高度なSEO設定</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">Google Analytics ID <Tip text="G-から始まるトラッキングIDを入力してください。" /></label>
                                <input type="text" value={siteConfig.google_analytics_id} onChange={e => setSiteConfig({...siteConfig, google_analytics_id: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" placeholder="G-XXXXXXXXXX" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">OGP画像URL (Default) <Tip text="SNSでシェアされた際に表示される画像のURLです。" /></label>
                                <input type="text" value={siteConfig.ogp_image_url} onChange={e => setSiteConfig({...siteConfig, ogp_image_url: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Twitter Card Type <Tip text="X(Twitter)での表示サイズ。大きな画像ならsummary_large_imageを推奨。" /></label>
                                <select value={siteConfig.twitter_card_type} onChange={e => setSiteConfig({...siteConfig, twitter_card_type: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600">
                                    <option value="summary">Summary</option>
                                    <option value="summary_large_image">Summary Large Image</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Twitter Username <Tip text="@username の形式で入力してください。" /></label>
                                <input type="text" value={siteConfig.twitter_site} onChange={e => setSiteConfig({...siteConfig, twitter_site: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" placeholder="@username" />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="robot_index" checked={siteConfig.robot_index} onChange={e => setSiteConfig({...siteConfig, robot_index: e.target.checked})} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                            <label htmlFor="robot_index" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">検索エンジンのインデックスを許可する (index) <Tip text="チェックを外すと noindex となり、検索結果に表示されなくなります。" /></label>
                        </div>
                    </div>

                    {/* リッチリザルト詳細 */}
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2 dark:border-gray-700">リッチリザルト (構造化データ)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">Publisher Type <Tip text="ブログの運営主体が個人か組織かを選択します。" /></label>
                                <select value={siteConfig.publisher_type} onChange={e => setSiteConfig({...siteConfig, publisher_type: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600">
                                    <option value="Person">Person (個人)</option>
                                    <option value="Organization">Organization (組織)</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Publisher Logo URL <Tip text="Google検索のナレッジパネル等に表示されるロゴ画像のURL。" /></label>
                                <input type="text" value={siteConfig.publisher_logo_url} onChange={e => setSiteConfig({...siteConfig, publisher_logo_url: e.target.value})} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Publisher Description <Tip text="ナレッジパネル等に表示される組織/個人の説明（空の場合はサイト説明が使われます）。" /></label>
                            <textarea value={siteConfig.publisher_description} onChange={e => setSiteConfig({...siteConfig, publisher_description: e.target.value})} rows={2} className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Social Profiles (SameAs) <Tip text="関連するSNSや公式サイトのURLリスト。検索エンジンに関係性を伝えます。" /></label>
                            {socialLinksArray.map((link, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input type="url" value={link} onChange={e => updateSocialLink(index, e.target.value)} className="flex-1 rounded border-gray-300 shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600" placeholder="https://..." />
                                    <button type="button" onClick={() => removeSocialLink(index)} className="px-3 bg-red-100 text-red-600 rounded hover:bg-red-200">削除</button>
                                </div>
                            ))}
                            <button type="button" onClick={addSocialLink} className="text-sm text-blue-600 hover:text-blue-800">+ リンクを追加</button>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded text-sm text-yellow-800 dark:text-yellow-200">
                        <p><strong>注意:</strong> サイト設定を保存すると、変更を反映するために自動的にサイトの再構築（ビルド）が開始されます。完了まで数分かかる場合があります。</p>
                    </div>

                    <button type="submit" disabled={isSaving} className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-bold">
                        <RiSave3Line className="mr-2" /> 設定を保存して適用
                    </button>
                </form>
            </Tabs.Content>
        </Tabs.Root>
      </div>
    </AdminLayout>
  );
}
