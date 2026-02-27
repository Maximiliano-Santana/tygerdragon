export type MembershipType = {
  id: string
  name: string
  duration_days: number
  price: number | null
  benefits: string[]
  is_active: boolean
  created_at: string
}

export type Member = {
  id: string
  name: string
  phone: string | null
  email: string | null
  photo_url: string | null
  membership_type_id: string | null
  membership_type?: MembershipType
  start_date: string
  end_date: string
  status: 'active' | 'inactive'
  notes: string | null
  created_at: string
  updated_at: string
}

export type MemberAccess = {
  allowed: boolean
  member: Pick<Member, 'id' | 'name' | 'photo_url' | 'end_date' | 'status'>
  membership_type: Pick<MembershipType, 'name'> | null
}
