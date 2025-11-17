import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/shared/StatusBadge'

describe('StatusBadge Component', () => {
  it('should render with default variant', () => {
    render(<StatusBadge status="Ativo" />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('should render with success variant', () => {
    const { container } = render(<StatusBadge status="Aprovado" variant="success" />)
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('should render with error variant', () => {
    const { container } = render(<StatusBadge status="Rejeitado" variant="error" />)
    expect(screen.getByText('Rejeitado')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-red-100')
  })

  it('should render with warning variant', () => {
    const { container } = render(<StatusBadge status="Pendente" variant="warning" />)
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-yellow-100')
  })

  it('should render with info variant', () => {
    const { container } = render(<StatusBadge status="Em Análise" variant="info" />)
    expect(screen.getByText('Em Análise')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-blue-100')
  })

  it('should render with custom className', () => {
    const { container } = render(
      <StatusBadge status="Custom" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
