import styled from 'styled-components';

export const Container = styled.div`
  max-width: 455px;
  margin: 0 auto;
  padding: 48px;
  background: white;
  border-radius: 24px;
  box-shadow: 0px 2px 4px 0px rgba(30, 27, 21, 0.05);
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  background: #f9f8f5;
  padding: 8px;
  border-radius: 16px;
  margin-bottom: 28px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: ${p => p.$active ? 'white' : 'transparent'};
  color: ${p => p.$active ? '#302F2D' : '#53514F'};
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${p => p.$active ? '0px 1px 2px 0px rgba(30, 27, 21, 0.05)' : 'none'};
  transition: all 0.2s;
  
  &:hover {
    background: ${p => p.$active ? 'white' : 'rgba(0, 0, 0, 0.02)'};
  }
`;

export const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const ToggleLabel = styled.p`
  font-family: 'Onest', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #302F2D;
  margin: 0;
`;

export const TimeRangeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  
  /* AppTimePicker внутри должен занимать всё доступное пространство */
  & > .app-time-picker {
    flex: 1 1 0;
    min-width: 50px;
  }
`;

export const UniformTimeContainer = styled(TimeRangeContainer)`
  margin-top: 16px;
`;

export const TimeLabel = styled.p`
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  color: #302F2D;
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const TimeSeparator = styled.div`
  width: 16px;
  height: 2px;
  background: #f4f3f0;
  border-radius: 4px;
  flex-shrink: 0;
`;

export const DayRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  
  &:not(:last-child) {
    margin-bottom: 12px;
  }
`;

export const DayName = styled.p`
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  color: #302F2D;
  width: 90px;
  margin: 0;
`;

export const ViewContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const HoursInfo = styled.div`
  font-family: 'Onest', sans-serif;
  font-size: 15px;
  
  p {
    margin: 0;
    line-height: 1.2;
  }
`;

export const HoursPrimary = styled.p`
  color: #302F2D;
  margin-bottom: 4px !important;
`;

export const HoursSecondary = styled.p`
  color: #888684;
`;

export const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export const SaveButton = styled.div`
  margin-top: 28px;
  width: 100%;
`;

export const DayScheduleSection = styled.div`
  margin-top: 20px;
`;

export const Title = styled.h1`
  font-family: 'Onest', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #302F2D;
  margin: 0 0 24px 0;
`;

export const SkeletonBox = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export const SkeletonTitle = styled(SkeletonBox)`
  height: 32px;
  width: 200px;
  margin-bottom: 24px;
`;

export const SkeletonTabs = styled(SkeletonBox)`
  height: 48px;
  margin-bottom: 28px;
`;

export const SkeletonContent = styled(SkeletonBox)`
  height: 200px;
`;

// Новые стили для отображения графика работы
export const ViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const ViewSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const ViewSectionContent = styled.div`
  flex: 1;
`;

export const DayScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DayScheduleItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DayNameText = styled.p`
  font-family: 'Onest', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  color: #302F2D;
  margin: 0;
`;

export const DayTimeText = styled.p`
  font-family: 'Onest', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  color: #888684;
  margin: 0;
`;

export const EditButtonWrapper = styled.div`
  flex-shrink: 0;
  
  .edit-button {
    width: 40px;
    height: 40px;
    min-width: 40px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
`;
