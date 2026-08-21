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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="fi" dir="ltr">
    <Head />
    <Preview>Nollaa salasanasi – Kotiluotsi</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kotiluotsi</Text>
        <Heading style={h1}>Nollaa salasanasi</Heading>
        <Text style={text}>
          Olet pyytänyt salasanan nollausta. Paina alla olevaa painiketta
          asettaaksesi uuden salasanan. Jos et pyytänyt tätä, jätä viesti
          huomiotta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Aseta uusi salasana
        </Button>
        <Text style={footer}>Kotiluotsi – kotiluotsi.fi</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
