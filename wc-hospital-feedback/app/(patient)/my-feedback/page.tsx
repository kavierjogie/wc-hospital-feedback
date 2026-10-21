import { createClient } from '@/lib/supabase/server'
import FeedbackList from '@/components/patient/FeedbackList'

export const revalidate = 0

export default async function MyFeedbackPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: feedbacks } = await supabase
    .from('feedback')
    .select('*, hospitals(name, district)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return <FeedbackList feedbacks={feedbacks as any} />
}
