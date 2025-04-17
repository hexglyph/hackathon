import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Desativa o 'bail', permitindo que o webpack compile todos os módulos e exiba todos os erros
    config.bail = false;
    return config;
  },
  images: {
    domains: [
      'capital.sp.gov.br',
      'www.capital.sp.gov.br',
      'www.sptrans.com.br',
      'educacao.sme.prefeitura.sp.gov.br',
      'agendamentosaude.prefeitura.sp.gov.br'
    ],
  },
}

export default nextConfig
