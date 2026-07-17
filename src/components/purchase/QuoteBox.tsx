import { QuoteResponse } from '../../api';
import { formatBrl, formatDecimal } from '../../utils/format';

type QuoteBoxProps = {
  quote: QuoteResponse;
};

export function QuoteBox({ quote }: QuoteBoxProps) {
  return (
    <div className="mt-4 rounded-md border border-[#e4e8de] bg-[#f9faf6] p-4 text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[#66715f]">Você recebe</span>
        <strong>
          {formatDecimal(quote.tokenAmount)} {quote.symbol}
        </strong>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-[#66715f]">Total</span>
        <strong>{formatBrl(quote.brlAmount)}</strong>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-[#66715f]">Preço</span>
        <strong>{formatBrl(quote.priceBrlPerToken)}</strong>
      </div>
    </div>
  );
}
