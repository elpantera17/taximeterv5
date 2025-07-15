import React, { useState, useEffect } from 'react';
import { Plus, Users, Settings, UserPlus, Copy, Check, Crown, Shield, Trash2, Edit2, UserCheck, UserX } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { VipBadge } from '../components/VipBadge';

interface WorkGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  groupCode: string;
  maxMembers: number;
  currentMembers: number;
  isActive: boolean;
  createdAt: Date;
}

interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  nickname?: string;
  joinedAt: Date;
  isActive: boolean;
}

export function WorkGroups() {
  const { state: authState } = useAuth();
  const currentUser = authState.currentUser;
  
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([
    {
      id: '1',
      name: 'Taxi Express RD',
      description: 'Grupo de taxis en Santo Domingo',
      ownerId: currentUser?.id || '',
      groupCode: 'TEX2024',
      maxMembers: getMaxMembers(currentUser?.role || 'normal'),
      currentMembers: 12,
      isActive: true,
      createdAt: new Date()
    }
  ]);

  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    {
      id: '1',
      userId: currentUser?.id || '',
      userName: `${currentUser?.firstName} ${currentUser?.lastName}`,
      userEmail: currentUser?.email || '',
      role: 'owner',
      joinedAt: new Date(),
      isActive: true
    },
    {
      id: '2',
      userId: '3',
      userName: 'María González',
      userEmail: 'maria@example.com',
      role: 'moderator',
      nickname: 'María (Moderadora)',
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '3',
      userId: '2',
      userName: 'Juan Pérez',
      userEmail: 'juan@example.com',
      role: 'member',
      nickname: 'Juan (Chofer)',
      joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<WorkGroup | null>(null);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function getMaxMembers(role: string): number {
    switch (role) {
      case 'vip2': return 50;
      case 'vip3': return 100;
      case 'vip4': return 300;
      case 'admin': return 999;
      default: return 0;
    }
  }

  const canCreateGroups = currentUser && ['vip2', 'vip3', 'vip4', 'admin'].includes(currentUser.role);

  const handleCreateGroup = (groupData: Partial<WorkGroup>) => {
    if (!currentUser) return;

    const newGroup: WorkGroup = {
      id: Date.now().toString(),
      name: groupData.name || '',
      description: groupData.description || '',
      ownerId: currentUser.id,
      groupCode: generateGroupCode(),
      maxMembers: getMaxMembers(currentUser.role),
      currentMembers: 1,
      isActive: true,
      createdAt: new Date()
    };

    setWorkGroups(prev => [...prev, newGroup]);
    
    // Agregar al usuario como owner
    const newMember: GroupMember = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userEmail: currentUser.email,
      role: 'owner',
      joinedAt: new Date(),
      isActive: true
    };

    setGroupMembers(prev => [...prev, newMember]);
    setShowCreateForm(false);
  };

  const generateGroupCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleViewMembers = (group: WorkGroup) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  const handleEditMember = (member: GroupMember) => {
    setSelectedMember(member);
    setShowEditMemberModal(true);
  };

  const handleUpdateMember = (updatedMember: Partial<GroupMember>) => {
    if (!selectedMember) return;
    
    setGroupMembers(prev => prev.map(member => 
      member.id === selectedMember.id ? { ...member, ...updatedMember } : member
    ));
    
    setShowEditMemberModal(false);
    setSelectedMember(null);
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedGroup) return;
    
    const member = groupMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Verificar permisos
    const currentUserMember = groupMembers.find(m => 
      m.userId === currentUser?.id && m.role === 'owner'
    );
    
    const currentUserIsModerator = groupMembers.find(m => 
      m.userId === currentUser?.id && m.role === 'moderator'
    );
    
    // Solo el dueño puede eliminar moderadores
    if (member.role === 'moderator' && !currentUserMember) {
      alert('Solo el dueño del grupo puede eliminar moderadores');
      return;
    }
    
    // Moderadores no pueden eliminar al dueño ni a otros moderadores
    if (currentUserIsModerator && (member.role === 'owner' || member.role === 'moderator')) {
      alert('No tienes permisos para eliminar a este miembro');
      return;
    }
    
    // No se puede eliminar al dueño
    if (member.role === 'owner') {
      alert('No se puede eliminar al dueño del grupo');
      return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar a ${member.nickname || member.userName} del grupo?`)) {
      setGroupMembers(prev => prev.filter(m => m.id !== memberId));
      
      // Actualizar contador de miembros
      setWorkGroups(prev => prev.map(group => 
        group.id === selectedGroup.id 
          ? { ...group, currentMembers: group.currentMembers - 1 } 
          : group
      ));
    }
  };

  const handleMakeModerator = (memberId: string) => {
    if (!selectedGroup) return;
    
    const member = groupMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Verificar si el usuario actual es el dueño
    const isOwner = groupMembers.some(m => 
      m.userId === currentUser?.id && 
      m.role === 'owner' && 
      selectedGroup.ownerId === currentUser?.id
    );
    
    if (!isOwner) {
      alert('Solo el dueño del grupo puede asignar moderadores');
      return;
    }
    
    // No se puede cambiar el rol del dueño
    if (member.role === 'owner') {
      alert('No se puede cambiar el rol del dueño del grupo');
      return;
    }
    
    const newRole = member.role === 'moderator' ? 'member' : 'moderator';
    const action = newRole === 'moderator' ? 'convertir en moderador' : 'quitar como moderador';
    
    if (confirm(`¿Estás seguro de que quieres ${action} a ${member.nickname || member.userName}?`)) {
      setGroupMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
    }
  };

  if (!canCreateGroups) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Grupos de Trabajo" />
        
        <div className="p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Función VIP Requerida
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Los grupos de trabajo están disponibles para usuarios VIP2 y superiores.
              Actualiza tu plan para acceder a esta funcionalidad.
            </p>
            <div className="space-y-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">Planes disponibles:</div>
              <div className="flex justify-center space-x-2">
                <VipBadge role="vip2" size="sm" showFullName />
                <VipBadge role="vip3" size="sm" showFullName />
                <VipBadge role="vip4" size="sm" showFullName />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Grupos de Trabajo" />
      
      <div className="p-4 space-y-6">
        {/* Header con información del plan */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Gestión de Grupos de Trabajo</h2>
              <p className="text-blue-100">
                Crea y administra grupos de choferes para tu negocio
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Tu plan permite</div>
              <div className="text-2xl font-bold">
                {getMaxMembers(currentUser?.role || 'normal')} choferes
              </div>
            </div>
          </div>
        </div>

        {/* Lista de grupos */}
        <div className="space-y-4">
          {workGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    <VipBadge role={currentUser?.role || 'normal'} size="sm" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {group.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Código del grupo</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {group.groupCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(group.groupCode)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {copiedCode === group.groupCode ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Miembros</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {group.currentMembers} / {group.maxMembers}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Estado</div>
                      <div className={`font-medium ${group.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {group.isActive ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Creado</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {group.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewMembers(group)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    title="Ver miembros"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Configuración"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Instrucciones para invitar */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Para invitar nuevos miembros:</p>
                    <p>Comparte el código <strong>{group.groupCode}</strong> con los choferes que quieras agregar. Ellos podrán unirse usando este código y tú deberás aprobar su solicitud.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón crear grupo */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>CREAR NUEVO GRUPO</span>
        </button>
      </div>

      {/* Modal crear grupo */}
      {showCreateForm && (
        <CreateGroupModal
          onSave={handleCreateGroup}
          onClose={() => setShowCreateForm(false)}
          maxMembers={getMaxMembers(currentUser?.role || 'normal')}
        />
      )}

      {/* Modal miembros */}
      {showMembersModal && selectedGroup && (
        <MembersModal
          group={selectedGroup}
          members={groupMembers.filter(m => m.userId === selectedGroup.ownerId || m.id === '2' || m.id === '3')}
          onClose={() => setShowMembersModal(false)}
          onEditMember={handleEditMember}
          onRemoveMember={handleRemoveMember}
          onMakeModerator={handleMakeModerator}
          currentUserId={currentUser?.id || ''}
        />
      )}

      {/* Modal editar miembro */}
      {showEditMemberModal && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onSave={handleUpdateMember}
          onClose={() => {
            setShowEditMemberModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
}

interface CreateGroupModalProps {
  onSave: (data: Partial<WorkGroup>) => void;
  onClose: () => void;
  maxMembers: number;
}

function CreateGroupModal({ onSave, onClose, maxMembers }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Crear Grupo de Trabajo
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del grupo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Taxi Express RD"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe tu grupo de trabajo..."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Límites de tu plan:</p>
              <p>Máximo {maxMembers} choferes en este grupo</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MembersModalProps {
  group: WorkGroup;
  members: GroupMember[];
  onClose: () => void;
  onEditMember: (member: GroupMember) => void;
  onRemoveMember: (memberId: string) => void;
  onMakeModerator: (memberId: string) => void;
  currentUserId: string;
}

function MembersModal({ 
  group, 
  members, 
  onClose, 
  onEditMember, 
  onRemoveMember, 
  onMakeModerator,
  currentUserId 
}: MembersModalProps) {
  const isOwner = group.ownerId === currentUserId;
  const currentUserMember = members.find(m => m.userId === currentUserId);
  const isModerator = currentUserMember?.role === 'moderator';

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs">
            <Crown className="w-3 h-3" />
            <span>Propietario</span>
          </div>
        );
      case 'moderator':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
            <Shield className="w-3 h-3" />
            <span>Moderador</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs">
            <Users className="w-3 h-3" />
            <span>Miembro</span>
          </div>
        );
    }
  };

  const canEditMember = (member: GroupMember) => {
    // El dueño puede editar a cualquiera
    if (isOwner) return true;
    
    // Moderadores pueden editar miembros normales
    if (isModerator && member.role === 'member') return true;
    
    return false;
  };

  const canRemoveMember = (member: GroupMember) => {
    // No se puede eliminar al dueño
    if (member.role === 'owner') return false;
    
    // El dueño puede eliminar a cualquiera
    if (isOwner) return true;
    
    // Moderadores pueden eliminar miembros normales
    if (isModerator && member.role === 'member') return true;
    
    return false;
  };

  const canMakeModerator = (member: GroupMember) => {
    // Solo el dueño puede asignar moderadores
    if (!isOwner) return false;
    
    // No se puede cambiar el rol del dueño
    if (member.role === 'owner') return false;
    
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Miembros de {group.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {group.currentMembers} de {group.maxMembers} miembros
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {member.userName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.nickname || member.userName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.userEmail}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getRoleBadge(member.role)}
                  
                  <div className="flex items-center space-x-1">
                    {canEditMember(member) && (
                      <button
                        onClick={() => onEditMember(member)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Editar miembro"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {canMakeModerator(member) && (
                      <button
                        onClick={() => onMakeModerator(member.id)}
                        className={`p-1.5 ${
                          member.role === 'moderator'
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                        } rounded-lg transition-colors`}
                        title={member.role === 'moderator' ? 'Quitar moderador' : 'Hacer moderador'}
                      >
                        {member.role === 'moderator' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    
                    {canRemoveMember(member) && (
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar del grupo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isOwner && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium mb-1">Gestión de moderadores:</p>
                  <p>Como dueño del grupo, puedes asignar moderadores que te ayuden a gestionar el grupo. Los moderadores pueden:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li>Editar la tarifa del grupo (pero no crear nuevas ni eliminarlas)</li>
                    <li>Eliminar miembros normales (pero no a otros moderadores ni al dueño)</li>
                    <li>Editar apodos de miembros normales</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EditMemberModalProps {
  member: GroupMember;
  onSave: (data: Partial<GroupMember>) => void;
  onClose: () => void;
}

function EditMemberModal({ member, onSave, onClose }: EditMemberModalProps) {
  const [nickname, setNickname] = useState(member.nickname || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nickname });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editar Miembro
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre real
            </label>
            <input
              type="text"
              value={member.userName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este es el nombre real del usuario y no se puede cambiar
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apodo personalizado
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Juan (Chofer Matutino)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este apodo solo será visible para ti y los miembros de tu grupo
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}