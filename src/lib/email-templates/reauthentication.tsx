import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

import { main, container, brand, h1, text, code, footer } from './styles'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="fi" dir="ltr">
    <Head />
    <Preview>Vahvistuskoodi – Kotiluotsi</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Kotiluotsi</Text>
        <Heading style={h1}>Vahvistuskoodi</Heading>
        <Text style={text}>Vahvistuskoodisi on:</Text>
        <Text style={code}>{token}</Text>
        <Text style={text}>Älä jaa koodia kenellekään.</Text>
        <Text style={footer}>Kotiluotsi – kotiluotsi.fi</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
