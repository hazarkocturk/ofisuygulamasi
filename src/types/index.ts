import type { Tables, TablesInsert, TablesUpdate } from './database.types'

// ─── Rol sabitleri ────────────────────────────────────────────────────────────
export type OfficeRole = 'admin' | 'supervisor' | 'member'
export type InvitationStatus = 'pending' | 'accepted' | 'expired'

// ─── DB satır tipleri (kaynak: generate_typescript_types) ─────────────────────
export type Profile          = Tables<'profiles'>
export type Office           = Tables<'offices'>
export type Department       = Tables<'departments'>
export type OfficeMember     = Tables<'office_members'>
export type DepartmentMember = Tables<'department_members'>
export type Invitation       = Tables<'invitations'>

// ─── Insert tipleri ───────────────────────────────────────────────────────────
export type OfficeInsert           = TablesInsert<'offices'>
export type DepartmentInsert       = TablesInsert<'departments'>
export type OfficeMemberInsert     = TablesInsert<'office_members'>
export type DepartmentMemberInsert = TablesInsert<'department_members'>
export type InvitationInsert       = TablesInsert<'invitations'>

// ─── Update tipleri ───────────────────────────────────────────────────────────
export type OfficeUpdate       = TablesUpdate<'offices'>
export type DepartmentUpdate   = TablesUpdate<'departments'>
export type OfficeMemberUpdate = TablesUpdate<'office_members'>

// ─── Zenginleştirilmiş (join) tipler ─────────────────────────────────────────
export type OfficeMemberWithProfile = OfficeMember & {
  profile: Profile
}

export type DepartmentWithMembers = Department & {
  department_members: DepartmentMemberWithProfile[]
}

export type DepartmentMemberWithProfile = DepartmentMember & {
  profile: Profile
}

export type InvitationWithDetails = Invitation & {
  office: Pick<Office, 'id' | 'name'>
  department: Pick<Department, 'id' | 'name'> | null
  inviter: Pick<Profile, 'id' | 'full_name'>
}

// ─── Davet token doğrulama sonucu ─────────────────────────────────────────────
export type InvitationValidation =
  | { valid: true;  invitation: InvitationWithDetails }
  | { valid: false; reason: 'not_found' | 'expired' | 'already_accepted' }
