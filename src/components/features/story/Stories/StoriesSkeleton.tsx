import { StorySkeleton } from './StorySkeleton';

type Props = {
  count?: number;
  icon?: React.ReactElement;
  title: React.ReactNode;
};

export const StoriesSkeleton = ({ count = 4, icon, title }: Props) => {
  return (
    <section>
      <div className="vstack gap-8">
        <h2 className="hstack gap-2 text-primary-1 text-3xl font-bold tracking-tighter leading-tight">
          {icon}
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-10">
          {Array.from({ length: count }, (_, index) => (
            <StorySkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
