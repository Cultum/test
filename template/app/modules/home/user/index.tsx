import * as React from 'react'
// hooks
import { useCurrentUser, useModal } from '../../../shared/hooks'
// components
import { View } from 'react-native'
import { ConfirmNavigationModal } from './components/confirm-navigation-modal'
import { UserCard, NavigationButton } from '../shared/components'
// constants
import { CONFIRM_NAV_MODAL } from '../../../shared/constants/modal'

const User = () => {
  const user = useCurrentUser()

  const { openModal } = useModal(CONFIRM_NAV_MODAL)

  const goToSettings = () => openModal()

  return (
    <View>
      <UserCard user={user} />
      <NavigationButton text={'Go to Settings'} onPress={goToSettings} />

      <ConfirmNavigationModal />
    </View>
  )
}

export { User }
