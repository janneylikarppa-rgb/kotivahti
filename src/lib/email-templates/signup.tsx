import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

import { main, container, brand, h1, text, button, footer } from './styles'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <Html lang="fi" dir="ltr">
    <Head />
    <Preview>Vahvista rekisteröitymisesi – Kotiluotsi</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kotiluotsi</Text>
        <Heading style={h1}>Tervetuloa Kotiluotsiin!</Heading>
        <Text style={text}>
          Vahvista sähköpostiosoitteesi painamalla alla olevaa painiketta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Vahvista rekisteröityminen
        </Button>
        <Text style={footer}>
          Jos et luonut tiliä, voit jättää tämän viestin huomiotta.
          <br />
          Kotiluotsi – kotiluotsi.fi
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
