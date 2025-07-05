import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { ProtectedRoute } from '../components/auth/protected-route';
import { useProfile } from '../hooks/useProfile';
import { AvatarPicker } from '../components/ui/avatar-picker';
import { ConfirmModal } from '../components/ui/confirm-modal';
import { translate } from '../utils/translations';

export function meta() {
  return [
    { title: translate('profile.pageTitle') },
    { name: 'description', content: translate('profile.pageDescription') },
  ];
}

// Validation schema
const profileSchema = z.object({
  nickname: z.string().min(3, translate('profile.errors.nicknameMin')).max(50, translate('profile.errors.nicknameMax')).optional().or(z.literal('')),
  avatar_url: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, translate('profile.errors.bioMax')).optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useProfile();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      avatar_url: user?.avatar_url || '/avatars/player_male_with_greataxe.png',
      bio: user?.bio || '',
    },
  });

  const watchedAvatar = watch('avatar_url');

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      // Filter out empty strings
      const updateData = {
        nickname: data.nickname || undefined,
        avatar_url: data.avatar_url || undefined,
        bio: data.bio || undefined,
      };

      await updateProfile(updateData);
      toast.success(translate('profile.success.profileUpdated'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translate('profile.errors.updateFailed');

      // Handle specific error codes
      if (errorMessage.includes('409')) {
        toast.error(translate('profile.errors.nicknameAlreadyTaken'));
      } else if (errorMessage.includes('400')) {
        toast.error(translate('profile.errors.invalidInput'));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // No need to show success toast as user will be redirected
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translate('profile.errors.deleteFailed');
      toast.error(errorMessage);
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FCC822] mb-4">
            {translate('profile.title')}
          </h1>
          <p className="text-gray-300 text-lg">
            {translate('profile.subtitle')}
          </p>
        </div>

        {/* Current User Info */}
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 mb-8 text-center">
          <div className="mb-6">
            <img
              src={watchedAvatar || user?.avatar || '/avatars/player_male_with_greataxe.png'}
              alt={user?.username}
              className="h-24 w-24 rounded-full mx-auto border-4 border-[#FCC822]"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {user?.nickname || user?.username}
          </h2>
          <p className="text-gray-300 mb-4">{user?.email}</p>
          <div className="flex justify-center items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src="/wisecoin/wisecoin.png"
                alt="Wisecoins"
                className="h-6 w-6"
              />
              <span className="text-[#FCC822] font-bold">
                {user?.wisecoins || 0} Wisecoins
              </span>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <span className="text-gray-300">
              {user?.role === 'admin' ? translate('profile.role.admin') : translate('profile.role.player')}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-[#FCC822] mb-6">
              {translate('profile.editProfile')}
            </h3>

            {/* Nickname */}
            <div className="mb-6">
              <label htmlFor="nickname" className="block text-gray-300 font-medium mb-2">
                {translate('profile.fields.nickname')}
              </label>
              <input
                id="nickname"
                type="text"
                {...register('nickname')}
                placeholder={translate('profile.fields.nicknamePlaceholder')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
              />
              {errors.nickname && (
                <p className="mt-2 text-red-400 text-sm">{errors.nickname.message}</p>
              )}
            </div>

            {/* Avatar Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-3">
                {translate('profile.fields.avatar')}
              </label>
              <AvatarPicker
                value={watchedAvatar}
                onChange={(avatarUrl) => setValue('avatar_url', avatarUrl, { shouldDirty: true })}
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label htmlFor="bio" className="block text-gray-300 font-medium mb-2">
                {translate('profile.fields.bio')}
              </label>
              <textarea
                id="bio"
                {...register('bio')}
                rows={4}
                placeholder={translate('profile.fields.bioPlaceholder')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent resize-none"
              />
              {errors.bio && (
                <p className="mt-2 text-red-400 text-sm">{errors.bio.message}</p>
              )}
              <p className="mt-1 text-gray-400 text-sm">
                {translate('profile.fields.bioHelper', { chars: String(watch('bio')?.length || 0), max: '500' })}
              </p>
            </div>

            {/* Save Button */}
            <div>
              <button
                type="submit"
                disabled={!isDirty || isUpdating}
                className={`btn-gradient px-6 py-3 rounded-lg font-medium transition-all ${
                  !isDirty || isUpdating
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isUpdating ? translate('profile.saving') : translate('profile.saveChanges')}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-xl p-8">
            <h3 className="text-xl font-bold text-red-400 mb-4">
              {translate('profile.dangerZone.title')}
            </h3>
            <p className="text-gray-300 mb-6">
              {translate('profile.dangerZone.deleteWarning')}
            </p>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {translate('profile.dangerZone.deleteButton')}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title={translate('profile.deleteModal.title')}
          message={translate('profile.deleteModal.message')}
          confirmLabel={isDeleting ? translate('profile.deleteModal.deleting') : translate('profile.deleteModal.confirm')}
          onConfirm={handleDeleteAccount}
          onCancel={() => setIsDeleteModalOpen(false)}
          confirmInput={{
            placeholder: translate('profile.deleteModal.inputPlaceholder'),
            expectedValue: user?.nickname || user?.username || '',
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
