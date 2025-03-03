import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Mail, UserCheck, Search } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const AdminUsersList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First try to get users from the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Не удалось загрузить пользователей');
        setUsers([]);
        return;
      }

      // Then get the email addresses from auth.users
      // Note: In a real app, you'd need proper admin access to do this
      // For demo purposes, we'll simulate this with mock data
      const usersWithEmail = profiles.map(profile => {
        // Extract email from id for demo purposes
        const mockEmail = `user${profile.id.substring(0, 5)}@example.com`;
        
        return {
          id: profile.id,
          email: mockEmail,
          full_name: profile.full_name,
          role: profile.role || 'user',
          created_at: profile.created_at
        };
      });

      setUsers(usersWithEmail);
    } catch (error) {
      console.error('Error in user fetching process:', error);
      toast.error('Не удалось загрузить пользователей');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: editRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: editRole } : user
        )
      );

      toast.success('Роль пользователя успешно обновлена');
      setEditingUserId(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Не удалось обновить роль пользователя');
    }
  };

  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      return 'Неверная дата';
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск пользователей..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Попробуйте изменить параметры поиска' : 'В системе еще нет пользователей'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата регистрации
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="user">Пользователь</option>
                        <option value="admin">Администратор</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? (
                          <UserCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUserId === user.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateRole(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditRole(user.role);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Изменить роль
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersList;