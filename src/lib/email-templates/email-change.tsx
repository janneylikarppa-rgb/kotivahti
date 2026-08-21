import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

import { main, container, brand, h1, text, link, button, footer } from './styles'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="fi" dir="ltr">
    <Head />
    <Preview>Vahvista uusi sähköposti – Kotiluotsi</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kotiluotsi</Text>
        <Heading style={h1}>Vahvista uusi sähköposti</Heading>
        <Text style={text}>
          Olet pyytänyt sähköpostiosoitteesi vaihtoa osoitteesta{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>
            {oldEmail}
          </Link>{' '}
          osoitteeseen{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          . Vahvista uusi osoite painamalla alla olevaa painiketta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Vahvista uusi sähköposti
        </Button>
        <Text style={footer}>
          Jos et pyytänyt muutosta, varmista tilisi turvallisuus heti.
          <br />
          Kotiluotsi – kotiluotsi.fi
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
