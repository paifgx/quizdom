import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuizQuestion } from '../../app/components/nine-slice-quiz/quiz-question'

describe('QuizQuestion', () => {
  const defaultProps = {
    question: 'What is the capital of France?'
  }

  it('renders the question text', () => {
    render(<QuizQuestion {...defaultProps} />)
    
    expect(screen.getByText('What is the capital of France?')).toBeDefined()
  })

  it('displays question text with proper styling', () => {
    render(<QuizQuestion {...defaultProps} />)
    
    const questionText = screen.getByText('What is the capital of France?')
    expect(questionText.className).toContain('text-[12px]')
    expect(questionText.className).toContain('p-4')
  })

  it('calls onQuestionClick when clicked', () => {
    const mockOnQuestionClick = vi.fn()
    render(<QuizQuestion {...defaultProps} onQuestionClick={mockOnQuestionClick} />)
    
    fireEvent.click(screen.getByText('What is the capital of France?'))
    
    expect(mockOnQuestionClick).toHaveBeenCalledTimes(1)
  })

  it('renders without onQuestionClick handler', () => {
    render(<QuizQuestion {...defaultProps} />)
    
    expect(screen.getByText('What is the capital of France?')).toBeDefined()
  })

  it('applies correct container styling', () => {
    const { container } = render(<QuizQuestion {...defaultProps} />)
    
    // Check for NineSlicePanel container with proper classes
    const panelContainer = container.firstChild as HTMLElement
    expect(panelContainer?.className).toContain('min-h-[80px]')
    expect(panelContainer?.className).toContain('mb-8')
    expect(panelContainer?.className).toContain('cursor-pointer')
  })

  it('has hover and focus styling', () => {
    const { container } = render(<QuizQuestion {...defaultProps} />)
    
    const panelContainer = container.firstChild as HTMLElement
    expect(panelContainer?.className).toContain('hover:brightness-110')
    expect(panelContainer?.className).toContain('focus:outline-2')
    expect(panelContainer?.className).toContain('focus:outline-[#fce9a5]')
    expect(panelContainer?.className).toContain('focus:outline-offset-2')
  })

  it('has transition animation', () => {
    const { container } = render(<QuizQuestion {...defaultProps} />)
    
    const panelContainer = container.firstChild as HTMLElement
    expect(panelContainer?.className).toContain('transition-all')
    expect(panelContainer?.className).toContain('duration-100')
  })

  it('renders with long question text', () => {
    const longQuestion = 'This is a very long question that might need to wrap to multiple lines and should still be displayed correctly within the nine-slice panel container.'
    
    render(<QuizQuestion question={longQuestion} />)
    
    expect(screen.getByText(longQuestion)).toBeDefined()
  })

  it('renders with short question text', () => {
    render(<QuizQuestion question="Yes?" />)
    
    expect(screen.getByText('Yes?')).toBeDefined()
  })

  it('renders with empty question text', () => {
    const { container } = render(<QuizQuestion question="" />)
    
    // Look for the specific paragraph element that contains the question text
    const questionText = container.querySelector('p.text-\\[12px\\].p-4')
    expect(questionText).toBeDefined()
    expect(questionText?.textContent).toBe('')
  })

  it('renders with special characters in question', () => {
    const specialQuestion = 'What is 2 + 2 = ? (Choose the correct answer!)'
    
    render(<QuizQuestion question={specialQuestion} />)
    
    expect(screen.getByText(specialQuestion)).toBeDefined()
  })

  it('does not call onQuestionClick when not provided', () => {
    render(<QuizQuestion {...defaultProps} />)
    
    // Should not throw error when clicking without handler
    expect(() => {
      fireEvent.click(screen.getByText('What is the capital of France?'))
    }).not.toThrow()
  })
}) 