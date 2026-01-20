import { cutStyles } from '@/types/cutStyles';
import { StyleCard } from './StyleCard';

export function StyleCarousel() {
  const triplicatedStyles = [...cutStyles, ...cutStyles, ...cutStyles];

  return (
    <section className="py-12 overflow-x-clip">
      <div className="carousel-container py-4">
        <div
          className="carousel-track"
          style={{
            width: `${cutStyles.length * 304 * 3}px`,
          }}
        >
          {triplicatedStyles.map((style, index) => (
            <StyleCard key={`${style.id}-${index}`} style={style} />
          ))}
        </div>
      </div>
    </section>
  );
}
