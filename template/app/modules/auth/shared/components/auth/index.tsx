import * as React from 'react'
// libs
import * as yup from 'yup'
import styled from 'styled-components/native'
import { yupResolver } from '@hookform/resolvers/yup'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
// hooks
import { useForm } from 'react-hook-form'
import { useToast } from '../../../../../shared/hooks'
import { useDispatch } from 'react-redux'
// components
import { AuthRedirect } from '../auth-redirect'
import { Button, Text, FormTextField } from '../../../../../shared/components'
// helpers
import {
  ClientError,
  RequestError,
  ClientSuccess,
  isClientError,
  isClientSuccess,
  getRequestErrorMessage,
} from '../../../../../shared/services/api'
// store
import * as API from '../../../../../store/modules/api'
import { setAuthorizedAction, setUserAction } from '../../../../../store/modules/profile'
// storage
import { storageManager } from '../../../../../shared/utils/storage'
// types
import { ThunkDispatch } from '../../../../../store/helpers'
import { LogInResponse, SignUpResponse } from '../../../../../shared/services/api/controllers'

// styled
const Wrapper = styled.View`
  flex-direction: column;
  flex: 1;
  justify-content: center;
`

// constants
const TEXT_STYLES = { mt: 12 }
const BUTTON_STYLES = { mt: 20 }
const HEADER_TEXT_STYLES = { align: 'center' as const, mb: 30 }

// types
interface Props {
  isSignUp?: boolean
  isLoading: boolean
  onNavButtonPress: () => void
  onFormSubmit: (data: FormInputs) => Promise<ClientSuccess<SignUpResponse | LogInResponse> | ClientError<RequestError>>
}

interface FormInputs {
  email: string
  password: string
}

// validation
const schema = yup.object().shape({
  email: yup.string().required('Required').nullable().email("E-mail isn't valid"),
  password: yup.string().min(6, 'Min length 6 characters').required('Required'),
})

const Auth: React.FC<Props> = ({ isSignUp = false, isLoading, onFormSubmit, onNavButtonPress }) => {
  const dispatch = useDispatch<ThunkDispatch>()

  const { openToast } = useToast()

  const { control, handleSubmit } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormInputs) => {
    Keyboard.dismiss()

    const res = await onFormSubmit(data)

    if (isClientSuccess(res)) {
      const { token } = res.data

      if ('id' in res.data) {
        const userRes = await dispatch(API.user.getUser.performAPIGetUser({ id: res.data.id }))

        if (isClientSuccess(userRes)) {
          dispatch(setUserAction(userRes.data.data))
        }
      }

      await storageManager.setAuthToken(token)
      dispatch(setAuthorizedAction(Boolean(token)))
    }

    if (isClientError(res)) {
      openToast({
        type: 'ERROR',
        preset: 'TEMPORARY',
        message: getRequestErrorMessage(res.error),
      })
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Wrapper>
        <Text textStyle={HEADER_TEXT_STYLES} preset={'screenHeader'}>
          {isSignUp ? 'Sign Up' : 'Log In'}
        </Text>
        <FormTextField control={control} label={'email'} name={'email'} />
        <FormTextField control={control} label={'password'} name={'password'} secureTextEntry />
        <Button
          isLoading={isLoading}
          buttonStyle={BUTTON_STYLES}
          onPress={handleSubmit(onSubmit)}
          text={isSignUp ? 'Sign Up' : 'Log In'}
        />

        <Text preset='secondary' textStyle={TEXT_STYLES}>
          For success {isSignUp ? 'register' : 'log in'} use: {'\n'}byron.fields@reqres.in - any 6 digits
        </Text>

        <AuthRedirect isSignUp={isSignUp} onNavButtonPress={onNavButtonPress} />
      </Wrapper>
    </TouchableWithoutFeedback>
  )
}

export { Auth }