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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="fi" dir="ltr">
    <Head />
    <Preview>Kutsu Kotiluotsiin</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kotiluotsi</Text>
        <Heading style={h1}>Kutsu Kotiluotsiin</Heading>
        <Text style={text}>
          Sinut on kutsuttu Kotiluotsiin. Luo tili painamalla alla olevaa
          painiketta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Luo tili
        </Button>
        <Text style={footer}>
          Jos et odottanut tätä kutsua, voit jättää viestin huomiotta.
          <br />
          Kotiluotsi – kotiluotsi.fi
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
