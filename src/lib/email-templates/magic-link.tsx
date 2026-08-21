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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="fi" dir="ltr">
    <Head />
    <Preview>Kirjautumislinkki – Kotiluotsi</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kotiluotsi</Text>
        <Heading style={h1}>Kirjautumislinkki</Heading>
        <Text style={text}>
          Paina alla olevaa painiketta kirjautuaksesi Kotiluotsiin. Linkki on
          voimassa rajoitetun ajan.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Kirjaudu sisään
        </Button>
        <Text style={footer}>
          Jos et pyytänyt linkkiä, voit jättää viestin huomiotta.
          <br />
          Kotiluotsi – kotiluotsi.fi
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
