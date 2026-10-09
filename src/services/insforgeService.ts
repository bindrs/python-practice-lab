import { createClient } from '@insforge/sdk';
import { ClassroomUser, ChatMessage, TeacherLiveAction } from '../components/classroomTypes';

const INSFORGE_URL =
  import.meta.env.VITE_INSFORGE_URL || 'https://xznb8vi4.us-east.insforge.app';
const INSFORGE_ANON_KEY =
  import.meta.env.VITE_INSFORGE_ANON_KEY ||
  'anon_5d38585d9192b66af50616768e87130f30981e20659f6e880f2b3af28c47ec1b';

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

export interface InsForgeUserRow {
  id?: string;
  session_id: string;
  role: string;
  username: string;
  class_code: string;
  joined_at: number;
  camera_active: boolean;
  mic_active: boolean;
  avatar_color: string | null;
  last_ping: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export class InsForgeClassroomService {
  private static instance: InsForgeClassroomService | null = null;
  public isConnected: boolean = true;
  public lastSyncTime: number = 0;

  public static getInstance(): InsForgeClassroomService {
    if (!InsForgeClassroomService.instance) {
      InsForgeClassroomService.instance = new InsForgeClassroomService();
    }
    return InsForgeClassroomService.instance;
  }

  /**
   * Save or update user in InsForge database
   */
  public async saveUser(user: ClassroomUser): Promise<boolean> {
    try {
      const userPayload = {
        session_id: user.sessionId,
        role: user.role,
        username: user.username,
        class_code: user.classCode,
        joined_at: user.joinedAt,
        camera_active: !!user.cameraActive,
        mic_active: !!user.micActive,
        avatar_color: user.avatarColor || null,
        last_ping: user.lastPing || Date.now(),
        is_active: true,
      };

      // Check if user already exists
      const { data: existing, error: selectErr } = await insforge.database
        .from('classroom_users')
        .select('id, session_id')
        .eq('session_id', user.sessionId)
        .limit(1);

      if (selectErr) {
        console.warn('InsForge check user warning:', selectErr);
      }

      if (existing && existing.length > 0) {
        // Update existing record
        const { error: updateErr } = await insforge.database
          .from('classroom_users')
          .update({
            ...userPayload,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', user.sessionId);

        if (updateErr) {
          console.error('InsForge update user error:', updateErr);
          return false;
        }
      } else {
        // Insert new record
        const { error: insertErr } = await insforge.database
          .from('classroom_users')
          .insert([userPayload]);

        if (insertErr) {
          console.error('InsForge insert user error:', insertErr);
          return false;
        }
      }

      this.lastSyncTime = Date.now();
      return true;
    } catch (err) {
      console.warn('InsForge saveUser network exception (handled):', err);
      return false;
    }
  }

  /**
   * Update user heartbeat ping in InsForge
   */
  public async pingUser(sessionId: string): Promise<void> {
    try {
      await insforge.database
        .from('classroom_users')
        .update({
          last_ping: Date.now(),
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);
    } catch {
      // ignore
    }
  }

  /**
   * Update media status (camera/mic) in InsForge
   */
  public async updateMedia(sessionId: string, cameraActive: boolean, micActive: boolean): Promise<void> {
    try {
      await insforge.database
        .from('classroom_users')
        .update({
          camera_active: cameraActive,
          mic_active: micActive,
          last_ping: Date.now(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);
    } catch {
      // ignore
    }
  }

  /**
   * Mark user as inactive in InsForge when "End Session" is explicitly clicked
   */
  public async deactivateUser(sessionId: string): Promise<void> {
    try {
      await insforge.database
        .from('classroom_users')
        .update({
          is_active: false,
          last_ping: Date.now(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);
    } catch {
      // ignore
    }
  }

  /**
   * Fetch active students and teachers for a class code from InsForge database
   */
  public async fetchClassUsers(classCode: string): Promise<ClassroomUser[]> {
    try {
      const cleanCode = classCode.trim().toUpperCase();
      const { data, error } = await insforge.database
        .from('classroom_users')
        .select()
        .eq('class_code', cleanCode)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error || !data) {
        return [];
      }

      const now = Date.now();
      // Filter users who pinged within last 60 seconds
      return data
        .filter((row: any) => now - (Number(row.last_ping) || 0) < 60000)
        .map((row: any): ClassroomUser => ({
          sessionId: row.session_id,
          role: row.role as 'teacher' | 'student',
          username: row.username,
          classCode: row.class_code,
          joinedAt: Number(row.joined_at) || now,
          cameraActive: !!row.camera_active,
          micActive: !!row.mic_active,
          avatarColor: row.avatar_color || '#38bdf8',
          lastPing: Number(row.last_ping) || now,
        }));
    } catch (err) {
      console.warn('InsForge fetchClassUsers error:', err);
      return [];
    }
  }

  /**
   * Persist code broadcasts from teacher into InsForge database
   */
  public async saveClassCode(classCode: string, teacherName: string, code: string): Promise<void> {
    try {
      await insforge.database
        .from('classroom_codes')
        .insert([{
          class_code: classCode.trim().toUpperCase(),
          teacher_name: teacherName,
          code,
          timestamp: Date.now(),
        }]);
    } catch {
      // ignore
    }
  }

  /**
   * Get latest teacher code from InsForge database
   */
  public async getLatestClassCode(classCode: string): Promise<{ code: string; teacherName: string; timestamp: number } | null> {
    try {
      const cleanCode = classCode.trim().toUpperCase();
      const { data, error } = await insforge.database
        .from('classroom_codes')
        .select()
        .eq('class_code', cleanCode)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      const row = data[0];
      return {
        code: row.code,
        teacherName: row.teacher_name,
        timestamp: Number(row.timestamp) || Date.now(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Save a chat message to InsForge database
   */
  public async saveMessage(msg: ChatMessage, classCode: string): Promise<boolean> {
    try {
      const cleanCode = classCode.trim().toUpperCase();
      const { error } = await insforge.database
        .from('classroom_messages')
        .insert([{
          class_code: cleanCode,
          sender_session_id: msg.senderSessionId,
          sender_name: msg.senderName,
          sender_role: msg.senderRole,
          sender_avatar: msg.senderAvatar,
          text: msg.text,
          timestamp: msg.timestamp,
        }]);

      if (error) {
        console.warn('InsForge saveMessage error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('InsForge saveMessage exception:', err);
      return false;
    }
  }

  /**
   * Fetch recent chat messages for a class code
   */
  public async fetchMessages(classCode: string): Promise<ChatMessage[]> {
    try {
      const cleanCode = classCode.trim().toUpperCase();
      const { data, error } = await insforge.database
        .from('classroom_messages')
        .select()
        .eq('class_code', cleanCode)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error || !data) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        senderSessionId: row.sender_session_id,
        senderName: row.sender_name,
        senderRole: row.sender_role,
        senderAvatar: row.sender_avatar || '#38bdf8',
        text: row.text,
        timestamp: Number(row.timestamp) || Date.now(),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Save teacher action in InsForge database
   */
  public async saveLiveAction(action: TeacherLiveAction, classCode: string): Promise<boolean> {
    try {
      const cleanCode = classCode.trim().toUpperCase();
      const { error } = await insforge.database
        .from('classroom_live_actions')
        .insert([{
          class_code: cleanCode,
          action_type: action.type,
          payload: action,
          teacher_name: action.teacherName,
          timestamp: action.timestamp,
        }]);

      if (error) {
        console.warn('InsForge saveLiveAction error:', error);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get latest teacher action from InsForge database
   */
  public async getLatestLiveAction(classCode: string): Promise<TeacherLiveAction | null> {
    try {
      const cleanCode = classCode.trim().toUpperCase();
      const { data, error } = await insforge.database
        .from('classroom_live_actions')
        .select()
        .eq('class_code', cleanCode)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      const row = data[0];
      return row.payload as TeacherLiveAction;
    } catch {
      return null;
    }
  }
}

export const insforgeService = InsForgeClassroomService.getInstance();
